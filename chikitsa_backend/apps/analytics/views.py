"""
Analytics views for Chikitsa.
Provides dashboard data and statistics.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta

from apps.core.permissions import IsDoctor


class PatientDashboardView(APIView):
    """
    Dashboard data for patients.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        from apps.appointments.models import Appointment
        
        user = request.user
        today = timezone.now().date()
        
        # Get appointment statistics
        appointments = Appointment.objects.filter(patient=user)
        
        stats = {
            'total_appointments': appointments.count(),
            'upcoming_appointments': appointments.filter(
                appointment_date__gte=today,
                status__in=['pending', 'confirmed']
            ).count(),
            'completed_appointments': appointments.filter(status='completed').count(),
            'cancelled_appointments': appointments.filter(status='cancelled').count(),
        }
        
        # Upcoming appointments preview
        upcoming = appointments.filter(
            appointment_date__gte=today,
            status__in=['pending', 'confirmed']
        ).select_related('doctor__user', 'doctor__specialty').order_by('appointment_date')[:5]
        
        upcoming_list = [{
            'id': str(apt.id),
            'doctor_name': apt.doctor.user.full_name,
            'specialty': apt.doctor.specialty.name,
            'date': str(apt.appointment_date),
            'time': apt.time_slot,
            'type': apt.appointment_type,
            'status': apt.status,
        } for apt in upcoming]
        
        return Response({
            'stats': stats,
            'upcoming_appointments': upcoming_list
        })


class DoctorDashboardView(APIView):
    """
    Dashboard data for doctors.
    """
    permission_classes = [permissions.IsAuthenticated, IsDoctor]
    
    def get(self, request):
        from apps.appointments.models import Appointment
        from apps.doctors.models import DoctorReview
        
        doctor = request.user.doctor_profile
        today = timezone.now().date()
        this_week_start = today - timedelta(days=today.weekday())
        this_week_end = this_week_start + timedelta(days=6)
        
        appointments = Appointment.objects.filter(doctor=doctor)
        
        # Calculate earnings from completed appointments
        completed_appointments = appointments.filter(status='completed')
        total_earnings = float(
            completed_appointments.aggregate(total=Sum('consultation_fee'))['total'] or 0
        )
        
        # Response matching frontend expectations
        response_data = {
            'total_appointments': appointments.count(),
            'appointments_today': appointments.filter(appointment_date=today).count(),
            'appointments_this_week': appointments.filter(
                appointment_date__gte=this_week_start,
                appointment_date__lte=this_week_end
            ).count(),
            'total_patients': doctor.total_patients,
            'total_earnings': total_earnings,
            'average_rating': float(doctor.average_rating),
            'total_reviews': doctor.total_reviews,
            'pending_appointments': appointments.filter(status='pending').count(),
        }
        
        # Today's appointments for the schedule view
        todays_appointments = appointments.filter(
            appointment_date=today,
            status__in=['pending', 'confirmed']
        ).select_related('patient').order_by('time_slot')
        
        response_data['upcoming_appointments'] = [{
            'id': str(apt.id),
            'patient_name': apt.patient.full_name,
            'appointment_date': apt.appointment_date.isoformat(),
            'time_slot': apt.time_slot,
            'status': apt.status,
            'appointment_type': apt.appointment_type,
            'symptoms': apt.patient_symptoms[:100] if apt.patient_symptoms else '',
        } for apt in todays_appointments[:10]]
        
        # Weekly appointment trend
        week_ago = today - timedelta(days=7)
        weekly_trend = appointments.filter(
            appointment_date__gte=week_ago
        ).values('appointment_date').annotate(count=Count('id')).order_by('appointment_date')
        
        response_data['weekly_trend'] = list(weekly_trend)
        
        # Recent reviews
        recent_reviews = DoctorReview.objects.filter(
            doctor=doctor,
            is_deleted=False
        ).select_related('patient')[:5]
        
        response_data['recent_reviews'] = [{
            'rating': review.rating,
            'comment': review.comment[:100] if review.comment else '',
            'patient': 'Anonymous' if review.is_anonymous else review.patient.full_name,
            'date': review.created_at.isoformat(),
        } for review in recent_reviews]
        
        return Response(response_data)

