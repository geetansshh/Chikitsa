"""
Appointment models for Chikitsa.
Comprehensive appointment management system.
"""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator

from apps.core.models import BaseModel, ActiveManager, AllObjectsManager
from apps.doctors.models import DoctorProfile


class Appointment(BaseModel):
    """
    Appointment model for booking doctor consultations.
    """
    
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        CONFIRMED = 'confirmed', _('Confirmed')
        IN_PROGRESS = 'in_progress', _('In Progress')
        COMPLETED = 'completed', _('Completed')
        CANCELLED = 'cancelled', _('Cancelled')
        NO_SHOW = 'no_show', _('No Show')
        RESCHEDULED = 'rescheduled', _('Rescheduled')
    
    class Type(models.TextChoices):
        IN_PERSON = 'in_person', _('In Person')
        VIDEO = 'video', _('Video Consultation')
        PHONE = 'phone', _('Phone Consultation')
    
    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', _('Pending')
        PAID = 'paid', _('Paid')
        REFUNDED = 'refunded', _('Refunded')
        FAILED = 'failed', _('Failed')
    
    # Relationships
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='appointments'
    )
    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.CASCADE,
        related_name='appointments'
    )
    
    # Appointment Details
    appointment_date = models.DateField(db_index=True)
    time_slot = models.CharField(max_length=10)  # Format: HH:MM
    end_time = models.CharField(max_length=10, blank=True)
    appointment_type = models.CharField(
        max_length=20,
        choices=Type.choices,
        default=Type.IN_PERSON
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    
    # Payment
    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )
    payment_id = models.CharField(max_length=100, blank=True)
    
    # Patient Information (snapshot at booking time)
    patient_symptoms = models.TextField(blank=True, help_text='Symptoms/reason for visit')
    patient_notes = models.TextField(blank=True)
    
    # Doctor's Notes
    doctor_notes = models.TextField(blank=True)
    prescription = models.TextField(blank=True)
    diagnosis = models.TextField(blank=True)
    
    # Cancellation
    cancelled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cancelled_appointments'
    )
    cancellation_reason = models.TextField(blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    
    # Managers
    objects = ActiveManager()
    all_objects = AllObjectsManager()
    
    class Meta:
        verbose_name = _('appointment')
        verbose_name_plural = _('appointments')
        ordering = ['-appointment_date', '-time_slot']
        # Prevent double booking
        constraints = [
            models.UniqueConstraint(
                fields=['doctor', 'appointment_date', 'time_slot'],
                condition=models.Q(status__in=['pending', 'confirmed']),
                name='unique_doctor_slot'
            )
        ]
    
    def __str__(self):
        return f'{self.patient} - Dr. {self.doctor.user.full_name} on {self.appointment_date}'
    
    @property
    def is_upcoming(self):
        """Check if appointment is upcoming."""
        from django.utils import timezone
        from datetime import datetime
        
        appointment_datetime = datetime.combine(
            self.appointment_date,
            datetime.strptime(self.time_slot, '%H:%M').time()
        )
        return (
            appointment_datetime > timezone.now().replace(tzinfo=None) and
            self.status in ['pending', 'confirmed']
        )
    
    @property
    def is_cancellable(self):
        """Check if appointment can be cancelled."""
        from django.utils import timezone
        from datetime import datetime, timedelta
        
        if self.status not in ['pending', 'confirmed']:
            return False
        
        appointment_datetime = datetime.combine(
            self.appointment_date,
            datetime.strptime(self.time_slot, '%H:%M').time()
        )
        # Can cancel up to 2 hours before appointment
        return appointment_datetime > timezone.now().replace(tzinfo=None) + timedelta(hours=2)
