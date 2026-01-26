"""
Signals for appointments app.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Appointment
from .tasks import send_appointment_confirmation_email, schedule_appointment_reminder


@receiver(post_save, sender=Appointment)
def appointment_created_handler(sender, instance, created, **kwargs):
    """
    Handle appointment creation - send confirmation and schedule reminders.
    """
    if created:
        # Send confirmation email
        send_appointment_confirmation_email.delay(str(instance.id))
        
        # Schedule reminder
        schedule_appointment_reminder.delay(str(instance.id))
