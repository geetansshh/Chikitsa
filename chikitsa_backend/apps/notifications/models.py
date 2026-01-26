"""
Notification models for Chikitsa.
"""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

from apps.core.models import TimeStampedModel


class Notification(TimeStampedModel):
    """
    User notification model.
    """
    
    class NotificationType(models.TextChoices):
        APPOINTMENT_BOOKED = 'appointment_booked', _('Appointment Booked')
        APPOINTMENT_CONFIRMED = 'appointment_confirmed', _('Appointment Confirmed')
        APPOINTMENT_CANCELLED = 'appointment_cancelled', _('Appointment Cancelled')
        APPOINTMENT_REMINDER = 'appointment_reminder', _('Appointment Reminder')
        APPOINTMENT_COMPLETED = 'appointment_completed', _('Appointment Completed')
        NEW_MESSAGE = 'new_message', _('New Message')
        NEW_REVIEW = 'new_review', _('New Review')
        SYSTEM = 'system', _('System Notification')
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Link to related object
    related_object_type = models.CharField(max_length=50, blank=True)
    related_object_id = models.CharField(max_length=50, blank=True)
    
    class Meta:
        verbose_name = _('notification')
        verbose_name_plural = _('notifications')
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.notification_type}: {self.title}'
    
    def mark_as_read(self):
        """Mark notification as read."""
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])


class NotificationPreference(TimeStampedModel):
    """
    User notification preferences.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )
    
    # Email notifications
    email_appointment_reminders = models.BooleanField(default=True)
    email_appointment_updates = models.BooleanField(default=True)
    email_marketing = models.BooleanField(default=False)
    
    # Push notifications
    push_enabled = models.BooleanField(default=True)
    push_appointment_reminders = models.BooleanField(default=True)
    push_new_messages = models.BooleanField(default=True)
    
    # SMS notifications
    sms_enabled = models.BooleanField(default=False)
    sms_appointment_reminders = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('notification preference')
        verbose_name_plural = _('notification preferences')
    
    def __str__(self):
        return f'Preferences for {self.user.email}'
