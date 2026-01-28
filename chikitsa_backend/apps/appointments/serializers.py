"""
Serializers for appointments app.
"""

from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Appointment, AppointmentDocument
from apps.doctors.serializers import DoctorListSerializer
from apps.users.serializers import UserSerializer


class PatientBasicSerializer(serializers.Serializer):
    """
    Basic patient info for appointment lists.
    """
    id = serializers.UUIDField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    phone_number = serializers.CharField(read_only=True)


class AppointmentListSerializer(serializers.ModelSerializer):
    """
    Serializer for appointment list view.
    """
    doctor_id = serializers.UUIDField(source='doctor.id', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.full_name', read_only=True)
    doctor_specialty = serializers.CharField(source='doctor.specialty.name', read_only=True)
    patient_name = serializers.CharField(source='patient.full_name', read_only=True)
    patient = PatientBasicSerializer(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    is_cancellable = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'doctor_id', 'doctor_name', 'doctor_specialty', 'patient_name', 'patient',
            'appointment_date', 'time_slot', 'appointment_type',
            'status', 'consultation_fee', 'payment_status',
            'patient_symptoms', 'is_upcoming', 'is_cancellable', 'created_at'
        ]


class AppointmentDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for appointment detail view.
    """
    doctor = DoctorListSerializer(read_only=True)
    patient = UserSerializer(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    is_cancellable = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'doctor', 'patient', 'appointment_date', 'time_slot',
            'end_time', 'appointment_type', 'status', 'consultation_fee',
            'payment_status', 'patient_symptoms', 'patient_notes',
            'doctor_notes', 'prescription', 'diagnosis',
            'cancellation_reason', 'cancelled_at',
            'is_upcoming', 'is_cancellable', 'created_at', 'updated_at'
        ]


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating appointments.
    """
    doctor_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'doctor_id', 'appointment_date', 'time_slot',
            'appointment_type', 'patient_symptoms', 'patient_notes'
        ]
        read_only_fields = ['id']
    
    def validate_doctor_id(self, value):
        from apps.doctors.models import DoctorProfile
        try:
            doctor = DoctorProfile.objects.get(id=value, is_verified=True)
            if not doctor.is_accepting_patients:
                raise serializers.ValidationError('Doctor is not accepting new patients')
            return value
        except DoctorProfile.DoesNotExist:
            raise serializers.ValidationError('Doctor not found')
    
    def validate_appointment_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError('Cannot book appointments in the past')
        if value > timezone.now().date() + timedelta(days=90):
            raise serializers.ValidationError('Cannot book appointments more than 90 days in advance')
        return value
    
    def validate(self, attrs):
        from apps.doctors.models import DoctorProfile, DoctorSchedule, DoctorLeave
        
        doctor = DoctorProfile.objects.get(id=attrs['doctor_id'])
        date = attrs['appointment_date']
        time_slot = attrs['time_slot']
        
        # Check if slot is already booked
        existing = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=date,
            time_slot=time_slot,
            status__in=['pending', 'confirmed']
        ).exists()
        
        if existing:
            raise serializers.ValidationError({'time_slot': 'This time slot is already booked'})
        
        # Check doctor's schedule
        day_of_week = date.weekday()
        try:
            schedule = DoctorSchedule.objects.get(
                doctor=doctor,
                day_of_week=day_of_week,
                is_available=True
            )
        except DoctorSchedule.DoesNotExist:
            raise serializers.ValidationError({'appointment_date': 'Doctor is not available on this day'})
        
        # Check for leaves
        is_on_leave = DoctorLeave.objects.filter(
            doctor=doctor,
            start_date__lte=date,
            end_date__gte=date
        ).exists()
        
        if is_on_leave:
            raise serializers.ValidationError({'appointment_date': 'Doctor is on leave on this date'})
        
        return attrs
    
    def create(self, validated_data):
        from apps.doctors.models import DoctorProfile
        
        doctor_id = validated_data.pop('doctor_id')
        doctor = DoctorProfile.objects.get(id=doctor_id)
        
        # Calculate end time
        start_time = datetime.strptime(validated_data['time_slot'], '%H:%M')
        end_time = start_time + timedelta(minutes=doctor.consultation_duration)
        
        # Set fee based on appointment type
        fee = doctor.consultation_fee
        if validated_data.get('appointment_type') == Appointment.Type.VIDEO:
            fee = doctor.video_consultation_fee or doctor.consultation_fee
        
        appointment = Appointment.objects.create(
            doctor=doctor,
            patient=self.context['request'].user,
            consultation_fee=fee,
            end_time=end_time.strftime('%H:%M'),
            **validated_data
        )
        
        return appointment


class AppointmentUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating appointments (by doctor).
    """
    
    class Meta:
        model = Appointment
        fields = ['status', 'doctor_notes', 'prescription', 'diagnosis']


class AppointmentCancelSerializer(serializers.Serializer):
    """
    Serializer for cancelling appointments.
    """
    reason = serializers.CharField(required=True, max_length=500)


class AppointmentRescheduleSerializer(serializers.Serializer):
    """
    Serializer for rescheduling appointments.
    """
    new_date = serializers.DateField()
    new_time_slot = serializers.CharField(max_length=10)
    
    def validate_new_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError('Cannot reschedule to a past date')
        return value


class AppointmentDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for appointment documents.
    """
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    
    class Meta:
        model = AppointmentDocument
        fields = [
            'id', 'document_type', 'title', 'file', 'notes',
            'uploaded_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AppointmentDocumentUploadSerializer(serializers.ModelSerializer):
    """
    Serializer for uploading appointment documents.
    """
    
    class Meta:
        model = AppointmentDocument
        fields = ['document_type', 'title', 'file', 'notes']
