"""
Custom exception handlers for consistent API error responses.
"""

from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException
from rest_framework import status
from django.http import Http404
from django.core.exceptions import PermissionDenied


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error response format.
    
    Response format:
    {
        "success": false,
        "error": {
            "code": "ERROR_CODE",
            "message": "Human readable message",
            "details": {} or []
        }
    }
    """
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response_data = {
            'success': False,
            'error': {
                'code': getattr(exc, 'default_code', 'error'),
                'message': str(exc.detail) if hasattr(exc, 'detail') else str(exc),
                'details': response.data if isinstance(response.data, (dict, list)) else None,
            }
        }
        response.data = custom_response_data
    
    return response


class ServiceUnavailable(APIException):
    """Custom exception for service unavailability."""
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'Service temporarily unavailable. Please try again later.'
    default_code = 'service_unavailable'


class ResourceConflict(APIException):
    """Custom exception for resource conflicts."""
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Resource conflict occurred.'
    default_code = 'conflict'


class RateLimitExceeded(APIException):
    """Custom exception for rate limiting."""
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_detail = 'Rate limit exceeded. Please try again later.'
    default_code = 'rate_limit_exceeded'


class PaymentRequired(APIException):
    """Custom exception for payment-related issues."""
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    default_detail = 'Payment required to access this resource.'
    default_code = 'payment_required'


class InvalidAppointmentTime(APIException):
    """Custom exception for invalid appointment times."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'The requested appointment time is not available.'
    default_code = 'invalid_appointment_time'


class ChatbotError(APIException):
    """Custom exception for chatbot-related errors."""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'An error occurred while processing your request.'
    default_code = 'chatbot_error'
