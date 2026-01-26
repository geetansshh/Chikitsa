"""
URL configuration for analytics app.
"""

from django.urls import path

from .views import (
    PatientDashboardView,
    DoctorDashboardView,
    AdminDashboardView,
    AppointmentAnalyticsView,
)

app_name = 'analytics'

urlpatterns = [
    path('dashboard/patient/', PatientDashboardView.as_view(), name='patient-dashboard'),
    path('dashboard/doctor/', DoctorDashboardView.as_view(), name='doctor-dashboard'),
    path('dashboard/admin/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('appointments/', AppointmentAnalyticsView.as_view(), name='appointment-analytics'),
]
