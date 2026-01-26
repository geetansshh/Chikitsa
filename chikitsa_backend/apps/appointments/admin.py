"""
Admin configuration for appointments app.
"""

from django.contrib import admin
from .models import Appointment, AppointmentDocument, AppointmentReminder


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = [
        'patient', 'doctor', 'appointment_date', 'time_slot',
        'status', 'payment_status', 'appointment_type'
    ]
    list_filter = ['status', 'payment_status', 'appointment_type', 'appointment_date']
    search_fields = [
        'patient__email', 'patient__first_name',
        'doctor__user__email', 'doctor__user__first_name'
    ]
    raw_id_fields = ['patient', 'doctor', 'cancelled_by', 'rescheduled_from']
    date_hierarchy = 'appointment_date'
    readonly_fields = ['created_at', 'updated_at', 'cancelled_at']


@admin.register(AppointmentDocument)
class AppointmentDocumentAdmin(admin.ModelAdmin):
    list_display = ['appointment', 'document_type', 'title', 'created_at']
    list_filter = ['document_type']
    raw_id_fields = ['appointment', 'uploaded_by']


@admin.register(AppointmentReminder)
class AppointmentReminderAdmin(admin.ModelAdmin):
    list_display = ['appointment', 'reminder_type', 'scheduled_at', 'is_sent']
    list_filter = ['reminder_type', 'is_sent']
    raw_id_fields = ['appointment']
