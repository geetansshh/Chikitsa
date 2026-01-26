"""
Core views for health checks and system status.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.db import connection
from django.conf import settings


class HealthCheckView(APIView):
    """
    Health check endpoint for monitoring and load balancers.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    
    def get(self, request):
        """
        Return health status of the application.
        """
        health_status = {
            'status': 'healthy',
            'version': '1.0.0',
            'services': {}
        }
        
        # Check database connection
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
            health_status['services']['database'] = 'healthy'
        except Exception as e:
            health_status['services']['database'] = 'unhealthy'
            health_status['status'] = 'degraded'
        
        # Check if in debug mode
        health_status['debug_mode'] = settings.DEBUG
        
        return Response(health_status, status=status.HTTP_200_OK)
