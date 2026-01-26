"""
Filters for doctors app.
"""

import django_filters
from .models import DoctorProfile


class DoctorFilter(django_filters.FilterSet):
    """
    Filter set for doctor listings.
    """
    specialty = django_filters.CharFilter(field_name='specialty__slug')
    specialty_id = django_filters.NumberFilter(field_name='specialty__id')
    city = django_filters.CharFilter(field_name='clinic_city', lookup_expr='icontains')
    min_fee = django_filters.NumberFilter(field_name='consultation_fee', lookup_expr='gte')
    max_fee = django_filters.NumberFilter(field_name='consultation_fee', lookup_expr='lte')
    min_rating = django_filters.NumberFilter(field_name='average_rating', lookup_expr='gte')
    min_experience = django_filters.NumberFilter(field_name='years_of_experience', lookup_expr='gte')
    language = django_filters.CharFilter(field_name='languages', lookup_expr='icontains')
    accepting_patients = django_filters.BooleanFilter(field_name='is_accepting_patients')
    
    class Meta:
        model = DoctorProfile
        fields = [
            'specialty', 'specialty_id', 'city', 'min_fee', 'max_fee',
            'min_rating', 'min_experience', 'language', 'accepting_patients'
        ]
