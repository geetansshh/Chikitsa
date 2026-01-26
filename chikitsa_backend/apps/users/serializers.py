"""
Serializers for the users app.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from dj_rest_auth.registration.serializers import RegisterSerializer

from .models import PatientProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model.
    Used for user details and profile updates.
    """
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'avatar', 'date_of_birth', 'gender',
            'address', 'is_verified', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'role', 'is_verified', 'created_at']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile.
    """
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'avatar',
            'date_of_birth', 'gender', 'address'
        ]


class CustomRegisterSerializer(RegisterSerializer):
    """
    Custom registration serializer with additional fields.
    Supports both patient and doctor registration.
    """
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)
    phone = serializers.CharField(required=False, max_length=20, allow_blank=True)
    role = serializers.ChoiceField(
        choices=User.Role.choices,
        default=User.Role.PATIENT
    )
    
    # Doctor-specific fields (only required when role is DOCTOR)
    specialty_id = serializers.IntegerField(required=False, allow_null=True)
    license_number = serializers.CharField(required=False, max_length=50, allow_blank=True)
    years_of_experience = serializers.IntegerField(required=False, default=0)
    education = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    clinic_name = serializers.CharField(required=False, max_length=200, allow_blank=True)
    clinic_address = serializers.CharField(required=False, allow_blank=True)
    clinic_city = serializers.CharField(required=False, max_length=100, allow_blank=True)
    clinic_state = serializers.CharField(required=False, max_length=100, allow_blank=True)
    clinic_zip = serializers.CharField(required=False, max_length=20, allow_blank=True)
    clinic_phone = serializers.CharField(required=False, max_length=20, allow_blank=True)
    consultation_fee = serializers.DecimalField(
        required=False, 
        max_digits=10, 
        decimal_places=2,
        default=0
    )
    
    # Remove username field since we use email-only authentication
    username = None
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove username from fields if it exists
        if 'username' in self.fields:
            del self.fields['username']
    
    def validate(self, data):
        data = super().validate(data)
        
        # If role is DOCTOR, ensure required doctor fields are provided
        if data.get('role') == User.Role.DOCTOR:
            required_doctor_fields = [
                'specialty_id', 'license_number', 'years_of_experience',
                'clinic_name', 'clinic_address', 'clinic_city',
                'clinic_phone', 'consultation_fee'
            ]
            missing_fields = [field for field in required_doctor_fields if not data.get(field)]
            if missing_fields:
                raise serializers.ValidationError({
                    field: 'This field is required for doctor registration.'
                    for field in missing_fields
                })
        
        return data
    
    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data.update({
            'first_name': self.validated_data.get('first_name', ''),
            'last_name': self.validated_data.get('last_name', ''),
            'phone': self.validated_data.get('phone', ''),
            'role': self.validated_data.get('role', User.Role.PATIENT),
            # Store doctor data to use in save()
            'doctor_data': {
                'specialty_id': self.validated_data.get('specialty_id'),
                'license_number': self.validated_data.get('license_number'),
                'years_of_experience': self.validated_data.get('years_of_experience', 0),
                'education': self.validated_data.get('education', ''),
                'bio': self.validated_data.get('bio', ''),
                'clinic_name': self.validated_data.get('clinic_name', ''),
                'clinic_address': self.validated_data.get('clinic_address', ''),
                'clinic_city': self.validated_data.get('clinic_city', ''),
                'clinic_state': self.validated_data.get('clinic_state', ''),
                'clinic_zip': self.validated_data.get('clinic_zip', ''),
                'clinic_phone': self.validated_data.get('clinic_phone', ''),
                'consultation_fee': self.validated_data.get('consultation_fee', 0),
            } if self.validated_data.get('role') == User.Role.DOCTOR else None
        })
        return data
    
    def save(self, request):
        user = super().save(request)
        user.first_name = self.cleaned_data.get('first_name')
        user.last_name = self.cleaned_data.get('last_name')
        user.phone = self.cleaned_data.get('phone', '')
        user.role = self.cleaned_data.get('role')
        user.save()
        
        # Create doctor profile if role is DOCTOR
        if user.role == User.Role.DOCTOR:
            from apps.doctors.models import DoctorProfile, Specialty
            
            doctor_data = self.cleaned_data.get('doctor_data', {})
            specialty = Specialty.objects.get(id=doctor_data['specialty_id'])
            
            DoctorProfile.objects.create(
                user=user,
                specialty=specialty,
                license_number=doctor_data.get('license_number'),
                years_of_experience=doctor_data.get('years_of_experience', 0),
                education=doctor_data.get('education', ''),
                bio=doctor_data.get('bio', ''),
                clinic_name=doctor_data.get('clinic_name'),
                clinic_address=doctor_data.get('clinic_address'),
                clinic_city=doctor_data.get('clinic_city'),
                clinic_state=doctor_data.get('clinic_state', ''),
                clinic_zip=doctor_data.get('clinic_zip', ''),
                clinic_phone=doctor_data.get('clinic_phone'),
                consultation_fee=doctor_data.get('consultation_fee', 0),
                is_verified=False,  # Doctors need to be verified by admin
            )
        
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    
    def validate_new_password(self, value):
        validate_password(value)
        return value


class PatientProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for patient profile.
    """
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = PatientProfile
        fields = [
            'id', 'user', 'blood_group', 'allergies', 'medical_conditions',
            'medications', 'emergency_contact_name', 'emergency_contact_phone',
            'emergency_contact_relation', 'insurance_provider', 'insurance_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PatientProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating patient profile.
    """
    
    class Meta:
        model = PatientProfile
        fields = [
            'blood_group', 'allergies', 'medical_conditions', 'medications',
            'emergency_contact_name', 'emergency_contact_phone',
            'emergency_contact_relation', 'insurance_provider', 'insurance_id'
        ]
