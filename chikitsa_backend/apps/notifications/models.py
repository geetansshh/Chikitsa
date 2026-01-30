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
