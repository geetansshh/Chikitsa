"""
URL configuration for doctors app.
"""

from django.urls import path

from .views import (
    SpecialtyListView,
    DoctorListView,
    DoctorDetailView,
    DoctorProfileView,
    DoctorRegisterView,
    DoctorScheduleListCreateView,
    DoctorScheduleDetailView,
    DoctorLeaveListCreateView,
    DoctorLeaveDetailView,
    DoctorAvailabilityView,
    DoctorReviewListView,
    DoctorReviewCreateView,
)

app_name = 'doctors'

urlpatterns = [
    # Public endpoints
    path('specialties/', SpecialtyListView.as_view(), name='specialty-list'),
    path('', DoctorListView.as_view(), name='doctor-list'),
    path('<uuid:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
    path('<uuid:doctor_id>/availability/', DoctorAvailabilityView.as_view(), name='doctor-availability'),
    path('<uuid:doctor_id>/reviews/', DoctorReviewListView.as_view(), name='doctor-reviews'),
    path('<uuid:doctor_id>/reviews/create/', DoctorReviewCreateView.as_view(), name='doctor-review-create'),
    
    # Doctor self-management (uses /me/ prefix)
    path('register/', DoctorRegisterView.as_view(), name='doctor-register'),
    path('me/', DoctorProfileView.as_view(), name='doctor-profile'),
    path('me/schedules/', DoctorScheduleListCreateView.as_view(), name='schedule-list-create'),
    path('me/schedules/<int:pk>/', DoctorScheduleDetailView.as_view(), name='schedule-detail'),
    path('me/leaves/', DoctorLeaveListCreateView.as_view(), name='leave-list-create'),
    path('me/leaves/<int:pk>/', DoctorLeaveDetailView.as_view(), name='leave-detail'),
]
