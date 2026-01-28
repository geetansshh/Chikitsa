"""
Custom permissions for the Chikitsa API.
Following Single Responsibility Principle - each permission class handles one concern.
"""

from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Check if object has user attribute
        if hasattr(obj, 'user'):
            return obj.user == request.user
        # Check if object has patient attribute
        if hasattr(obj, 'patient'):
            return obj.patient == request.user
        return False


class IsDoctor(permissions.BasePermission):
    """
    Permission to check if user is a verified doctor.
    """
    message = 'You must be a verified doctor to access this resource.'
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            hasattr(request.user, 'doctor_profile') and
            request.user.doctor_profile.is_verified
        )


class IsPatient(permissions.BasePermission):
    """
    Permission to check if user is a patient.
    """
    message = 'You must be a patient to access this resource.'
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            hasattr(request.user, 'patient_profile')
        )


class IsAdmin(permissions.BasePermission):
    """
    Permission to check if user is an admin.
    """
    message = 'Admin privileges required.'
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff


class IsDoctorOrReadOnly(permissions.BasePermission):
    """
    Permission that allows doctors full access, others read-only.
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user.is_authenticated and 
            hasattr(request.user, 'doctor_profile')
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
