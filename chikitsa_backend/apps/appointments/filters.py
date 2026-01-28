"""
Filters for appointments app.
"""

import django_filters
from .models import Appointment


class AppointmentFilter(django_filters.FilterSet):
    """
    Filter set for appointment listings.
    """
    date = django_filters.DateFilter(field_name='appointment_date')
    date_from = django_filters.DateFilter(field_name='appointment_date', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='appointment_date', lookup_expr='lte')
    status = django_filters.ChoiceFilter(choices=Appointment.Status.choices)
    appointment_type = django_filters.ChoiceFilter(choices=Appointment.Type.choices)
    payment_status = django_filters.ChoiceFilter(choices=Appointment.PaymentStatus.choices)
    
    class Meta:
        model = Appointment
        fields = ['status', 'appointment_type', 'payment_status', 'date', 'date_from', 'date_to']
