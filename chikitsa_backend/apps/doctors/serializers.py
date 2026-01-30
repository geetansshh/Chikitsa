"""
Serializers for doctors app.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.conf import settings

from .models import Specialty, DoctorProfile, DoctorSchedule, DoctorLeave, DoctorReview

User = get_user_model()


class SpecialtySerializer(serializers.ModelSerializer):
    """
    Serializer for Specialty model.
    """
    doctor_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Specialty
        fields = ['id', 'name', 'slug', 'description', 'icon', 'doctor_count']
    
    def get_doctor_count(self, obj):
        queryset = obj.doctors.filter(is_deleted=False)
        if settings.REQUIRE_DOCTOR_VERIFICATION:
            queryset = queryset.filter(is_verified=True)
        return queryset.count()


class DoctorUserSerializer(serializers.ModelSerializer):
    """
    Simplified user serializer for doctor responses.
    """
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'avatar']


class DoctorScheduleSerializer(serializers.ModelSerializer):
    """
    Serializer for DoctorSchedule model.
    """
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = DoctorSchedule
        fields = [
            'id', 'day_of_week', 'day_name', 'start_time', 'end_time',
            'slot_duration', 'is_available', 'break_start', 'break_end'
        ]


class DoctorListSerializer(serializers.ModelSerializer):
    """
    Serializer for doctor list view (minimal info).
    """
    user = DoctorUserSerializer(read_only=True)
    specialty = SpecialtySerializer(read_only=True)
    
    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'user', 'specialty', 'clinic_name', 'clinic_city',
            'consultation_fee', 'years_of_experience', 'average_rating',
            'total_reviews', 'is_accepting_patients', 'languages'
        ]


class DoctorDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for doctor detail view (full info).
    """
    user = DoctorUserSerializer(read_only=True)
    specialty = SpecialtySerializer(read_only=True)
    schedules = DoctorScheduleSerializer(many=True, read_only=True)
    full_address = serializers.CharField(read_only=True)
    
    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'user', 'specialty', 'license_number', 'years_of_experience',
            'education', 'bio', 'clinic_name', 'clinic_address', 'clinic_city',
            'clinic_state', 'clinic_zip', 'clinic_phone', 'full_address',
            'consultation_fee', 'video_consultation_fee', 'consultation_duration',
            'is_accepting_patients', 'max_patients_per_day', 'is_verified',
            'average_rating', 'total_reviews', 'total_patients', 'languages',
            'schedules', 'created_at'
        ]


class DoctorProfileCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating doctor profile.
    """
    specialty_id = serializers.PrimaryKeyRelatedField(
        queryset=Specialty.objects.all(),
        source='specialty',
        write_only=True
    )
    
    class Meta:
        model = DoctorProfile
        fields = [
            'specialty_id', 'license_number', 'years_of_experience',
            'education', 'bio', 'clinic_name', 'clinic_address', 'clinic_city',
            'clinic_state', 'clinic_zip', 'clinic_phone', 'consultation_fee',
            'video_consultation_fee', 'consultation_duration', 'languages'
        ]


class DoctorProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating doctor profile.
    """
    
    class Meta:
        model = DoctorProfile
        fields = [
            'bio', 'clinic_name', 'clinic_address', 'clinic_city',
            'clinic_state', 'clinic_zip', 'clinic_phone', 'consultation_fee',
            'video_consultation_fee', 'consultation_duration',
            'is_accepting_patients', 'max_patients_per_day', 'languages'
        ]


class DoctorLeaveSerializer(serializers.ModelSerializer):
    """
    Serializer for DoctorLeave model.
    """
    
    class Meta:
        model = DoctorLeave
        fields = [
            'id', 'start_date', 'end_date', 'reason', 'is_full_day',
            'start_time', 'end_time', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DoctorReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for DoctorReview model.
    """
    patient_name = serializers.SerializerMethodField()
    
    class Meta:
        model = DoctorReview
        fields = [
            'id', 'rating', 'title', 'comment', 'patient_name',
            'is_anonymous', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_patient_name(self, obj):
        if obj.is_anonymous:
            return 'Anonymous'
        return obj.patient.full_name


class DoctorReviewCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating doctor reviews.
    """
    
    class Meta:
        model = DoctorReview
        fields = ['rating', 'title', 'comment', 'is_anonymous']
    
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5')
        return value
