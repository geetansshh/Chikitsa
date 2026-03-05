"""
Custom exception handlers for consistent API error responses.
"""

from django.db import IntegrityError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def _pick_message(data):
    """Extract a user-friendly message from DRF error payloads."""
    if isinstance(data, dict):
        if isinstance(data.get('detail'), str):
            return data['detail']
        for key in ('non_field_errors', 'email', 'password', 'password1', 'password2'):
            value = data.get(key)
            if isinstance(value, list) and value:
                return str(value[0])
            if isinstance(value, str):
                return value
        # Fallback: first field's first message.
        for value in data.values():
            if isinstance(value, list) and value:
                return str(value[0])
            if isinstance(value, str):
                return value
    if isinstance(data, list) and data:
        return str(data[0])
    return 'An error occurred.'


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

    if response is None:
        if isinstance(exc, IntegrityError):
            message = 'Duplicate data detected. Please use unique values and try again.'
            details = {'non_field_errors': [message]}
            return Response(
                {
                    'success': False,
                    'error': {
                        'code': 'duplicate_data',
                        'message': message,
                        'details': details,
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {
                'success': False,
                'error': {
                    'code': 'internal_error',
                    'message': 'Something went wrong on the server.',
                    'details': None,
                },
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    
    details = response.data if isinstance(response.data, (dict, list)) else None
    custom_response_data = {
        'success': False,
        'error': {
            'code': getattr(exc, 'default_code', 'error'),
            'message': _pick_message(details),
            'details': details,
        }
    }
    response.data = custom_response_data

    return response
