"""
Custom throttle classes for rate-limiting sensitive endpoints.
"""

from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """
    Throttle login attempts to prevent brute-force attacks.
    Rate is configured via DEFAULT_THROTTLE_RATES['login'] in settings.
    """
    scope = 'login'
