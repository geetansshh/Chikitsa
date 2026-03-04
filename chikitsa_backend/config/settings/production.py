"""
Production settings for Chikitsa project.
Optimized for security and performance.
"""

from .base import *
import os

DEBUG = False

# Force SECRET_KEY from environment — crash if missing
SECRET_KEY = os.environ['SECRET_KEY']

# Get ALLOWED_HOSTS from environment or use Render default
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '.onrender.com').split(',')

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

# Email - Use actual SMTP in production
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# Logging - use console on Render (no persistent disk on free tier)
LOGGING['handlers']['file'] = {
    'class': 'logging.StreamHandler',
    'formatter': 'verbose',
}

# AllAuth - Require email verification in production
ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
