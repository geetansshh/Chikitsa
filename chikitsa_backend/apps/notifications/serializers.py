"""
Serializers for notifications app.
"""

from rest_framework import serializers
from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model.
    """
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'is_read', 'read_at', 'related_object_type',
            'related_object_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer for NotificationPreference model.
    """
    
    class Meta:
        model = NotificationPreference
        fields = [
            'email_appointment_reminders', 'email_appointment_updates',
            'email_marketing', 'push_enabled', 'push_appointment_reminders',
            'push_new_messages', 'sms_enabled', 'sms_appointment_reminders'
        ]
