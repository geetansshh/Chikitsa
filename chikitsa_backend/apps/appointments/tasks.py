"""
Celery tasks for appointments app.
"""

from celery import shared_task
from django.conf import settings
from datetime import datetime, timedelta

from apps.core.utils import send_notification_email


@shared_task
def send_appointment_confirmation_email(appointment_id: str):
    """
    Send appointment confirmation email to patient.
    """
    from .models import Appointment
    
    try:
        appointment = Appointment.objects.select_related(
            'patient', 'doctor__user', 'doctor__specialty'
        ).get(id=appointment_id)
    except Appointment.DoesNotExist:
        return
    
    subject = f'Appointment Confirmed - {appointment.doctor.user.full_name}'
    message = f"""
    Dear {appointment.patient.full_name},
    
    Your appointment has been booked successfully.
    
    Details:
    - Doctor: Dr. {appointment.doctor.user.full_name}
    - Specialty: {appointment.doctor.specialty.name}
    - Date: {appointment.appointment_date}
    - Time: {appointment.time_slot}
    - Type: {appointment.get_appointment_type_display()}
    - Fee: ${appointment.consultation_fee}
    
    Location: {appointment.doctor.full_address}
    
    Please arrive 10 minutes before your scheduled time.
    
    Thank you for choosing Chikitsa.
    """
    
    send_notification_email(
        to_email=appointment.patient.email,
        subject=subject,
        message=message
    )


@shared_task
def schedule_appointment_reminder(appointment_id: str):
    """
    Schedule reminder for an appointment.
    """
    from .models import Appointment, AppointmentReminder
    
    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return
    
    # Create reminder for 24 hours before
    appointment_datetime = datetime.combine(
        appointment.appointment_date,
        datetime.strptime(appointment.time_slot, '%H:%M').time()
    )
    reminder_time = appointment_datetime - timedelta(hours=24)
    
    AppointmentReminder.objects.create(
        appointment=appointment,
        reminder_type='email',
        scheduled_at=reminder_time
    )


@shared_task
def send_appointment_reminders():
    """
    Send pending appointment reminders.
    Run this task every hour via Celery Beat.
    """
    from django.utils import timezone
    from .models import AppointmentReminder
    
    now = timezone.now()
    pending_reminders = AppointmentReminder.objects.filter(
        is_sent=False,
        scheduled_at__lte=now,
        appointment__status__in=['pending', 'confirmed']
    ).select_related('appointment__patient', 'appointment__doctor__user')
    
    for reminder in pending_reminders:
        appointment = reminder.appointment
        
        subject = f'Reminder: Appointment Tomorrow with Dr. {appointment.doctor.user.full_name}'
        message = f"""
        Dear {appointment.patient.full_name},
        
        This is a reminder for your upcoming appointment.
        
        Details:
        - Doctor: Dr. {appointment.doctor.user.full_name}
        - Date: {appointment.appointment_date}
        - Time: {appointment.time_slot}
        
        Please ensure you arrive on time.
        
        Thank you,
        Chikitsa Team
        """
        
        send_notification_email(
            to_email=appointment.patient.email,
            subject=subject,
            message=message
        )
        
        reminder.is_sent = True
        reminder.sent_at = now
        reminder.save()
