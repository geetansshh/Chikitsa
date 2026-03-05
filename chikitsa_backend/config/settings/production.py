"""
Production settings for Chikitsa project.
Optimized for security and performance.
"""

from .base import *
import os

DEBUG = False

# Force SECRET_KEY from environment — crash if missing
SECRET_KEY = os.environ['SECRET_KEY']

# Get ALLOWED_HOSTS from environment and include Render-assigned hostname.
allowed_hosts = [h.strip() for h in os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if h.strip()]
render_hostname = os.getenv('RENDER_EXTERNAL_HOSTNAME', '').strip()
if render_hostname and render_hostname not in allowed_hosts:
    allowed_hosts.append(render_hostname)
ALLOWED_HOSTS = allowed_hosts

# Get CORS origins from environment
cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', '')
if cors_origins == '*':
    CORS_ALLOW_ALL_ORIGINS = True
elif cors_origins:
    CORS_ALLOWED_ORIGINS = [o.strip() for o in cors_origins.split(',') if o.strip()]
else:
    CORS_ALLOWED_ORIGINS = []

CORS_ALLOW_CREDENTIALS = True

# Security settings
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Content Security Policy (basic restrictive policy)
SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin'
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'

# Static files with WhiteNoise
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Database - Use PostgreSQL in production
DATABASES = {
    'default': env.db('DATABASE_URL')
}

# Email backend can be configured via env.
# Keep a safe default so auth doesn't break when SMTP is not configured yet.
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')

# Logging - use console logging in containerized deployments
LOGGING['handlers']['file'] = {
    'class': 'logging.StreamHandler',
    'formatter': 'verbose',
}

# AllAuth email verification policy (mandatory/optional/none)
# Default to "none" so deployed behavior matches local no-email flow.
ACCOUNT_EMAIL_VERIFICATION = os.getenv('ACCOUNT_EMAIL_VERIFICATION', 'none')
