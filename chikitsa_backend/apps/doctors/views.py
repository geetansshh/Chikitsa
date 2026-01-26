"""
Views for doctors app.
"""

from rest_framework import generics, status, permissions, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from datetime import datetime, timedelta

from .models import Specialty, DoctorProfile, DoctorSchedule, DoctorLeave, DoctorReview
from .serializers import (
    SpecialtySerializer,
    DoctorListSerializer,
    DoctorDetailSerializer,
    DoctorProfileCreateSerializer,
    DoctorProfileUpdateSerializer,
    DoctorScheduleSerializer,
    DoctorLeaveSerializer,
    DoctorReviewSerializer,
    DoctorReviewCreateSerializer,
)
from .filters import DoctorFilter
from apps.core.permissions import IsDoctor, IsOwnerOrAdmin
from apps.core.utils import generate_time_slots


class SpecialtyListView(generics.ListAPIView):
    """
    List all medical specialties.
    """
    queryset = Specialty.objects.filter(is_active=True)
    serializer_class = SpecialtySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Return all specialties without pagination


class DoctorListView(generics.ListAPIView):
    """
    List and search doctors.
    Supports filtering, searching, and ordering.
    """
    serializer_class = DoctorListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DoctorFilter
    search_fields = ['user__first_name', 'user__last_name', 'specialty__name', 'clinic_city']
    ordering_fields = ['average_rating', 'consultation_fee', 'years_of_experience']
    ordering = ['-average_rating']
    
    def get_queryset(self):
        return DoctorProfile.objects.filter(
            is_verified=True,
            is_accepting_patients=True
        ).select_related('user', 'specialty')


class DoctorDetailView(generics.RetrieveAPIView):
    """
    Get detailed doctor information.
    """
    queryset = DoctorProfile.objects.filter(is_verified=True)
    serializer_class = DoctorDetailSerializer
    permission_classes = [permissions.AllowAny]


class DoctorProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update own doctor profile.
    """
    permission_classes = [permissions.IsAuthenticated, IsDoctor]
    
    def get_object(self):
        return self.request.user.doctor_profile
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DoctorProfileUpdateSerializer
        return DoctorDetailSerializer


class DoctorRegisterView(generics.CreateAPIView):
    """
    Register as a doctor.
    """
    serializer_class = DoctorProfileCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Update user role to doctor
        user = self.request.user
        user.role = user.Role.DOCTOR
        user.save(update_fields=['role'])
        
        serializer.save(user=user)


class DoctorScheduleListCreateView(generics.ListCreateAPIView):
    """
    List or create doctor schedules.
    """
    serializer_class = DoctorScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]
    pagination_class = None  # Return all schedules without pagination
    
    def get_queryset(self):
        return DoctorSchedule.objects.filter(doctor=self.request.user.doctor_profile)
    
    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user.doctor_profile)


class DoctorScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Get, update, or delete a doctor schedule.
    """
    serializer_class = DoctorScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]
    
    def get_queryset(self):
        return DoctorSchedule.objects.filter(doctor=self.request.user.doctor_profile)


class DoctorLeaveListCreateView(generics.ListCreateAPIView):
    """
    List or create doctor leaves.
    """
    serializer_class = DoctorLeaveSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]
    pagination_class = None  # Return all leaves without pagination
    
    def get_queryset(self):
        return DoctorLeave.objects.filter(doctor=self.request.user.doctor_profile)
    
    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user.doctor_profile)


class DoctorLeaveDetailView(generics.RetrieveDestroyAPIView):
    """
    Get or delete a doctor leave.
    """
    serializer_class = DoctorLeaveSerializer
    permission_classes = [permissions.IsAuthenticated, IsDoctor]
    
    def get_queryset(self):
        return DoctorLeave.objects.filter(doctor=self.request.user.doctor_profile)


class DoctorAvailabilityView(APIView):
    """
    Get available time slots for a doctor on a specific date.
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, doctor_id):
        date_str = request.query_params.get('date')
        
        if not date_str:
            return Response(
                {'error': 'Date parameter is required (YYYY-MM-DD)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            doctor = DoctorProfile.objects.get(id=doctor_id)
        except DoctorProfile.DoesNotExist:
            return Response(
                {'error': 'Doctor not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get schedule for the day
        day_of_week = date.weekday()
        try:
            schedule = DoctorSchedule.objects.get(
                doctor=doctor,
                day_of_week=day_of_week,
                is_available=True
            )
        except DoctorSchedule.DoesNotExist:
            return Response({'available_slots': [], 'message': 'Doctor not available on this day'})
        
        # Check for leaves
        is_on_leave = DoctorLeave.objects.filter(
            doctor=doctor,
            start_date__lte=date,
            end_date__gte=date
        ).exists()
        
        if is_on_leave:
            return Response({'available_slots': [], 'message': 'Doctor is on leave'})
        
        # Generate time slots
        from apps.appointments.models import Appointment
        
        all_slots = generate_time_slots(
            start_hour=schedule.start_time.hour,
            end_hour=schedule.end_time.hour,
            interval_minutes=doctor.consultation_duration,
            date=date
        )
        
        # Filter out booked slots
        booked_appointments = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=date,
            status__in=['pending', 'confirmed']
        ).values_list('time_slot', flat=True)
        
        available_slots = [slot for slot in all_slots if slot not in booked_appointments]
        
        return Response({
            'date': date_str,
            'doctor': doctor.user.full_name,
            'available_slots': available_slots,
            'consultation_duration': doctor.consultation_duration,
            'consultation_fee': str(doctor.consultation_fee)
        })


class DoctorReviewListView(generics.ListAPIView):
    """
    List reviews for a doctor.
    """
    serializer_class = DoctorReviewSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        doctor_id = self.kwargs['doctor_id']
        return DoctorReview.objects.filter(
            doctor_id=doctor_id,
            is_deleted=False
        ).select_related('patient')


class DoctorReviewCreateView(generics.CreateAPIView):
    """
    Create a review for a doctor.
    """
    serializer_class = DoctorReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        doctor_id = self.kwargs['doctor_id']
        doctor = DoctorProfile.objects.get(id=doctor_id)
        
        # Check if user has had an appointment with this doctor
        from apps.appointments.models import Appointment
        has_appointment = Appointment.objects.filter(
            patient=self.request.user,
            doctor=doctor,
            status='completed'
        ).exists()
        
        review = serializer.save(
            doctor=doctor,
            patient=self.request.user,
            is_verified=has_appointment
        )
        
        # Update doctor's average rating
        doctor.update_rating(review.rating)
