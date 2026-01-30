"""
Custom permissions for the Chikitsa API.
Following Single Responsibility Principle - each permission class handles one concern.
"""

from rest_framework import permissions
from django.conf import settings


class IsDoctor(permissions.BasePermission):
    """
    Permission to check if user is a verified doctor.
    """
    message = 'You must be a verified doctor to access this resource.'
    
    def has_permission(self, request, view):
        if not settings.REQUIRE_DOCTOR_VERIFICATION:
            return (
                request.user.is_authenticated and
                hasattr(request.user, 'doctor_profile')
            )
        return (
            request.user.is_authenticated and 
            hasattr(request.user, 'doctor_profile') and
            request.user.doctor_profile.is_verified
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission that allows owners or admins to access.
    """
    
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'patient'):
            return obj.patient == request.user
        if hasattr(obj, 'doctor'):
            return obj.doctor.user == request.user
        
        return False
