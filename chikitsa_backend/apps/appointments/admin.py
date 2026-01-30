"""
Admin configuration for appointments app.
"""

from django.contrib import admin
from .models import Appointment


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
    raw_id_fields = ['patient', 'doctor', 'cancelled_by']
    date_hierarchy = 'appointment_date'
    readonly_fields = ['created_at', 'updated_at', 'cancelled_at']

