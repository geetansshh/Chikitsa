"""
Views for appointments app.
"""

from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
from django.db.models import Q

from .models import Appointment, AppointmentDocument
from .serializers import (
    AppointmentListSerializer,
    AppointmentDetailSerializer,
    AppointmentCreateSerializer,
    AppointmentUpdateSerializer,
    AppointmentCancelSerializer,
    AppointmentRescheduleSerializer,
    AppointmentDocumentSerializer,
    AppointmentDocumentUploadSerializer,
)
from .filters import AppointmentFilter
from apps.core.permissions import IsOwner, IsDoctor, IsOwnerOrAdmin


class AppointmentListCreateView(generics.ListCreateAPIView):
    """
    GET: List user's appointments
    POST: Create new appointment
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = AppointmentFilter
    ordering_fields = ['appointment_date', 'created_at', 'status']
    ordering = ['-appointment_date']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_doctor and hasattr(user, 'doctor_profile'):
            # Doctors see their appointments
            return Appointment.objects.filter(
                doctor=user.doctor_profile
            ).select_related('patient', 'doctor__user', 'doctor__specialty')
        else:
            # Patients see their own appointments
            return Appointment.objects.filter(
                patient=user
            ).select_related('doctor__user', 'doctor__specialty')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AppointmentCreateSerializer
        return AppointmentListSerializer


class AppointmentDetailView(generics.RetrieveUpdateAPIView):
    """
    GET: Get appointment details
    PUT/PATCH: Update appointment (doctor only)
    """
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_doctor and hasattr(user, 'doctor_profile'):
            return Appointment.objects.filter(doctor=user.doctor_profile)
        else:
            return Appointment.objects.filter(patient=user)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AppointmentUpdateSerializer
        return AppointmentDetailSerializer


class AppointmentCancelView(APIView):
    """
    Cancel an appointment.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            user = request.user
            
            if user.is_doctor and hasattr(user, 'doctor_profile'):
                appointment = Appointment.objects.get(pk=pk, doctor=user.doctor_profile)
            else:
                appointment = Appointment.objects.get(pk=pk, patient=user)
        except Appointment.DoesNotExist:
            return Response(
                {'error': 'Appointment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not appointment.is_cancellable:
            return Response(
                {'error': 'This appointment cannot be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AppointmentCancelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        appointment.status = Appointment.Status.CANCELLED
        appointment.cancelled_by = request.user
        appointment.cancellation_reason = serializer.validated_data['reason']
        appointment.cancelled_at = timezone.now()
        appointment.save()
        
        return Response(
            {'message': 'Appointment cancelled successfully'},
            status=status.HTTP_200_OK
        )


class AppointmentRescheduleView(APIView):
    """
    Reschedule an appointment.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            appointment = Appointment.objects.get(pk=pk, patient=request.user)
        except Appointment.DoesNotExist:
            return Response(
                {'error': 'Appointment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if appointment.status not in ['pending', 'confirmed']:
            return Response(
                {'error': 'Only pending or confirmed appointments can be rescheduled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = AppointmentRescheduleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        new_date = serializer.validated_data['new_date']
        new_time_slot = serializer.validated_data['new_time_slot']
        
        # Check if new slot is available
        existing = Appointment.objects.filter(
            doctor=appointment.doctor,
            appointment_date=new_date,
            time_slot=new_time_slot,
            status__in=['pending', 'confirmed']
        ).exclude(pk=pk).exists()
        
        if existing:
            return Response(
                {'error': 'The requested time slot is not available'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark old appointment as rescheduled
        old_date = appointment.appointment_date
        old_time = appointment.time_slot
        
        appointment.appointment_date = new_date
        appointment.time_slot = new_time_slot
        appointment.status = Appointment.Status.PENDING
        appointment.save()
        
        return Response({
            'message': 'Appointment rescheduled successfully',
            'old_date': str(old_date),
            'old_time': old_time,
            'new_date': str(new_date),
            'new_time': new_time_slot
        }, status=status.HTTP_200_OK)


class AppointmentConfirmView(APIView):
    """
    Confirm an appointment (Doctor only).
    """
    permission_classes = [permissions.IsAuthenticated, IsDoctor]
    
    def post(self, request, pk):
        try:
            appointment = Appointment.objects.get(
                pk=pk,
                doctor=request.user.doctor_profile
            )
        except Appointment.DoesNotExist:
            return Response(
                {'error': 'Appointment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if appointment.status != Appointment.Status.PENDING:
            return Response(
                {'error': 'Only pending appointments can be confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        appointment.status = Appointment.Status.CONFIRMED
        appointment.save(update_fields=['status'])
        
        return Response(
            {'message': 'Appointment confirmed successfully'},
            status=status.HTTP_200_OK
        )


class AppointmentCompleteView(APIView):
    """
    Mark appointment as completed (Doctor only).
    """
    permission_classes = [permissions.IsAuthenticated, IsDoctor]
    
    def post(self, request, pk):
        try:
            try:
                appointment = Appointment.objects.get(
                    pk=pk,
                    doctor=request.user.doctor_profile
                )
            except Appointment.DoesNotExist:
                return Response(
                    {'error': 'Appointment not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if appointment.status == 'completed':
                return Response(
                    {'error': 'Appointment already completed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update appointment
            appointment.status = 'completed'
            appointment.doctor_notes = request.data.get('doctor_notes', appointment.doctor_notes)
            appointment.prescription = request.data.get('prescription', appointment.prescription)
            appointment.diagnosis = request.data.get('diagnosis', appointment.diagnosis)
            appointment.save()
            
            # Send notification to patient for review
            from apps.notifications.models import Notification
            Notification.objects.create(
                user=appointment.patient,
                notification_type='appointment_completed',
                title='How was your consultation?',
                message=f'Please share your experience with Dr. {appointment.doctor.user.full_name}',
                related_object_type='appointment',
                related_object_id=str(appointment.id)
            )
            
            return Response({
                'message': 'Appointment marked as completed',
                'appointment': AppointmentDetailSerializer(appointment).data
            })
        except Exception as e:
            import traceback
            print(f"Error in complete appointment: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {'error': f'Server error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UpcomingAppointmentsView(generics.ListAPIView):
    """
    List upcoming appointments for the current user.
    """
    serializer_class = AppointmentListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        today = timezone.now().date()
        
        base_query = Q(
            appointment_date__gte=today,
            status__in=['pending', 'confirmed']
        )
        
        if user.is_doctor and hasattr(user, 'doctor_profile'):
            return Appointment.objects.filter(
                base_query,
                doctor=user.doctor_profile
            ).select_related('patient')
        else:
            return Appointment.objects.filter(
                base_query,
                patient=user
            ).select_related('doctor__user', 'doctor__specialty')


class PastAppointmentsView(generics.ListAPIView):
    """
    List past appointments for the current user.
    """
    serializer_class = AppointmentListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        today = timezone.now().date()
        
        base_query = Q(
            Q(appointment_date__lt=today) | Q(status='completed')
        )
        
        if user.is_doctor and hasattr(user, 'doctor_profile'):
            return Appointment.objects.filter(
                base_query,
                doctor=user.doctor_profile
            ).select_related('patient')
        else:
            return Appointment.objects.filter(
                base_query,
                patient=user
            ).select_related('doctor__user', 'doctor__specialty')


class AppointmentCompleteView(APIView):
    """
    Mark appointment as completed (doctor only).
    """
    permission_classes = [permissions.IsAuthenticated, IsDoctor]
    
    def post(self, request, pk):
        try:
            appointment = Appointment.objects.get(
                pk=pk,
                doctor=request.user.doctor_profile
            )
        except Appointment.DoesNotExist:
            return Response(
                {'error': 'Appointment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if appointment.status == 'completed':
            return Response(
                {'error': 'Appointment already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Update appointment
            appointment.status = 'completed'
            appointment.doctor_notes = request.data.get('doctor_notes', appointment.doctor_notes)
            appointment.prescription = request.data.get('prescription', appointment.prescription)
            appointment.diagnosis = request.data.get('diagnosis', appointment.diagnosis)
            appointment.save()
            
            # Send notification to patient for review
            from apps.notifications.models import Notification
            Notification.objects.create(
                user=appointment.patient,
                notification_type='appointment_completed',
                title='How was your consultation?',
                message=f'Please share your experience with Dr. {appointment.doctor.user.full_name}',
                related_object_type='appointment',
                related_object_id=str(appointment.id)
            )
            
            return Response({
                'message': 'Appointment marked as completed',
                'appointment': AppointmentDetailSerializer(appointment).data
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AppointmentPaymentView(APIView):
    """
    Process payment for appointment (simulated payment gateway).
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            try:
                appointment = Appointment.objects.get(pk=pk, patient=request.user)
            except Appointment.DoesNotExist:
                return Response(
                    {'error': 'Appointment not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if appointment.payment_status == 'paid':
                return Response(
                    {'error': 'Payment already completed'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Simulate payment gateway processing
            payment_method = request.data.get('payment_method', 'card')
            
            # In real implementation, integrate with Razorpay, Stripe, etc.
            # For now, we'll simulate successful payment
            import uuid
            payment_id = f'PAY_{uuid.uuid4().hex[:12].upper()}'
            
            appointment.payment_status = 'paid'
            appointment.payment_id = payment_id
            appointment.status = 'confirmed'  # Auto-confirm on payment
            appointment.save()
            
            # Send notification
            from apps.notifications.models import Notification
            Notification.objects.create(
                user=appointment.patient,
                notification_type='appointment_confirmed',
                title='Payment Successful',
                message=f'Your payment of ₹{appointment.consultation_fee} has been received. Appointment confirmed!',
                related_object_type='appointment',
                related_object_id=str(appointment.id)
            )
            
            return Response({
                'message': 'Payment successful',
                'payment_id': payment_id,
                'appointment': AppointmentDetailSerializer(appointment).data
            })
        except Exception as e:
            import traceback
            print(f"Payment error: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {'error': f'Payment processing failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AppointmentDocumentListCreateView(generics.ListCreateAPIView):
    """
    List or upload documents for an appointment.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        appointment_id = self.kwargs['appointment_id']
        return AppointmentDocument.objects.filter(appointment_id=appointment_id)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AppointmentDocumentUploadSerializer
        return AppointmentDocumentSerializer
    
    def perform_create(self, serializer):
        appointment_id = self.kwargs['appointment_id']
        appointment = Appointment.objects.get(id=appointment_id)
        serializer.save(
            appointment=appointment,
            uploaded_by=self.request.user
        )
