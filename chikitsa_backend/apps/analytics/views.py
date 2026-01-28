"""
Analytics views for Chikitsa.
Provides dashboard data and statistics.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count, Avg, Sum
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta

from apps.core.permissions import IsDoctor, IsAdmin


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
        total_earnings = completed_appointments.count() * float(doctor.consultation_fee)
        
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
            'status': apt.status.upper(),
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


class AdminDashboardView(APIView):
    """
    Dashboard data for admins.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        from django.contrib.auth import get_user_model
        from apps.appointments.models import Appointment
        from apps.doctors.models import DoctorProfile, Specialty
        
        User = get_user_model()
        today = timezone.now().date()
        month_ago = today - timedelta(days=30)
        
        # User stats
        user_stats = {
            'total_users': User.objects.count(),
            'total_patients': User.objects.filter(role='PATIENT').count(),
            'total_doctors': User.objects.filter(role='DOCTOR').count(),
            'new_users_this_month': User.objects.filter(created_at__gte=month_ago).count(),
        }
        
        # Doctor stats
        doctor_stats = {
            'total_doctors': DoctorProfile.objects.count(),
            'verified_doctors': DoctorProfile.objects.filter(is_verified=True).count(),
            'pending_verification': DoctorProfile.objects.filter(is_verified=False).count(),
        }
        
        # Appointment stats
        appointments = Appointment.objects.all()
        appointment_stats = {
            'total_appointments': appointments.count(),
            'this_month': appointments.filter(created_at__gte=month_ago).count(),
            'completed': appointments.filter(status='completed').count(),
            'cancelled': appointments.filter(status='cancelled').count(),
        }
        
        # Revenue (total consultation fees)
        revenue_stats = appointments.filter(
            status='completed',
            payment_status='paid'
        ).aggregate(
            total_revenue=Sum('consultation_fee'),
            this_month=Sum('consultation_fee', filter=models.Q(created_at__gte=month_ago))
        )
        
        # Specialty distribution
        specialty_distribution = DoctorProfile.objects.filter(
            is_verified=True
        ).values('specialty__name').annotate(count=Count('id')).order_by('-count')[:10]
        
        # Monthly trend
        monthly_trend = appointments.filter(
            created_at__gte=today - timedelta(days=180)
        ).annotate(month=TruncMonth('created_at')).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        return Response({
            'user_stats': user_stats,
            'doctor_stats': doctor_stats,
            'appointment_stats': appointment_stats,
            'revenue_stats': revenue_stats,
            'specialty_distribution': list(specialty_distribution),
            'monthly_trend': list(monthly_trend),
        })


class AppointmentAnalyticsView(APIView):
    """
    Detailed appointment analytics.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        from apps.appointments.models import Appointment
        
        today = timezone.now().date()
        
        # Date range from query params
        days = int(request.query_params.get('days', 30))
        start_date = today - timedelta(days=days)
        
        appointments = Appointment.objects.filter(
            appointment_date__gte=start_date
        )
        
        # Status distribution
        status_distribution = appointments.values('status').annotate(
            count=Count('id')
        )
        
        # Type distribution
        type_distribution = appointments.values('appointment_type').annotate(
            count=Count('id')
        )
        
        # Daily trend
        daily_trend = appointments.annotate(
            date=TruncDate('appointment_date')
        ).values('date').annotate(count=Count('id')).order_by('date')
        
        # Peak hours
        hour_distribution = appointments.values('time_slot').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        return Response({
            'period_days': days,
            'total_appointments': appointments.count(),
            'status_distribution': list(status_distribution),
            'type_distribution': list(type_distribution),
            'daily_trend': list(daily_trend),
            'peak_hours': list(hour_distribution),
        })
