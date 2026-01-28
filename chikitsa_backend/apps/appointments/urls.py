"""
URL configuration for appointments app.
"""

from django.urls import path

from .views import (
    AppointmentListCreateView,
    AppointmentDetailView,
    AppointmentCancelView,
    AppointmentRescheduleView,
    AppointmentConfirmView,
    AppointmentCompleteView,
    AppointmentPaymentView,
    UpcomingAppointmentsView,
    PastAppointmentsView,
    AppointmentDocumentListCreateView,
)

app_name = 'appointments'

urlpatterns = [
    # Appointment CRUD
    path('', AppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('<uuid:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    
    # Appointment actions
    path('<uuid:pk>/cancel/', AppointmentCancelView.as_view(), name='appointment-cancel'),
    path('<uuid:pk>/reschedule/', AppointmentRescheduleView.as_view(), name='appointment-reschedule'),
    path('<uuid:pk>/confirm/', AppointmentConfirmView.as_view(), name='appointment-confirm'),
    path('<uuid:pk>/complete/', AppointmentCompleteView.as_view(), name='appointment-complete'),
    path('<uuid:pk>/payment/', AppointmentPaymentView.as_view(), name='appointment-payment'),
    
    # Filtered lists
    path('upcoming/', UpcomingAppointmentsView.as_view(), name='upcoming-appointments'),
    path('past/', PastAppointmentsView.as_view(), name='past-appointments'),
    
    # Documents
    path('<uuid:appointment_id>/documents/', AppointmentDocumentListCreateView.as_view(), name='appointment-documents'),
]
