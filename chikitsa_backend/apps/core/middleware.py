"""
Custom middleware for the Chikitsa application.
"""

import logging
import time
import uuid

from django.conf import settings

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """
    Middleware for logging all API requests.
    Useful for debugging and monitoring.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Generate request ID for tracing
        request_id = str(uuid.uuid4())[:8]
        request.request_id = request_id
        
        # Start timing
        start_time = time.time()
        
        # Process request
        response = self.get_response(request)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Log request details (only in debug mode or for slow requests)
        if settings.DEBUG or duration > 1.0:
            logger.info(
                f"[{request_id}] {request.method} {request.path} "
                f"- {response.status_code} ({duration:.2f}s)"
            )
        
        # Add request ID to response headers
        response['X-Request-ID'] = request_id
        
        return response
