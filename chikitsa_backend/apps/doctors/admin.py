"""
Admin configuration for doctors app.
"""

from django.contrib import admin
from .models import Specialty, DoctorProfile, DoctorSchedule, DoctorLeave, DoctorReview


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'specialty', 'clinic_city', 'is_verified',
        'average_rating', 'is_accepting_patients'
    ]
    list_filter = ['specialty', 'is_verified', 'is_accepting_patients', 'clinic_city']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'clinic_name']
    raw_id_fields = ['user']
    readonly_fields = ['average_rating', 'total_reviews', 'total_patients']


@admin.register(DoctorSchedule)
class DoctorScheduleAdmin(admin.ModelAdmin):
    list_display = ['doctor', 'day_of_week', 'start_time', 'end_time', 'is_available']
    list_filter = ['day_of_week', 'is_available']
    raw_id_fields = ['doctor']


@admin.register(DoctorLeave)
class DoctorLeaveAdmin(admin.ModelAdmin):
    list_display = ['doctor', 'start_date', 'end_date', 'reason']
    list_filter = ['start_date']
    raw_id_fields = ['doctor']


@admin.register(DoctorReview)
class DoctorReviewAdmin(admin.ModelAdmin):
    list_display = ['doctor', 'patient', 'rating', 'is_verified', 'created_at']
    list_filter = ['rating', 'is_verified', 'is_anonymous']
    raw_id_fields = ['doctor', 'patient']
