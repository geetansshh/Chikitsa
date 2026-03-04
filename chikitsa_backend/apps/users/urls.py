"""
URL configuration for users app.
"""

from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from dj_rest_auth.views import LoginView, PasswordResetView, PasswordResetConfirmView

from apps.core.throttles import LoginRateThrottle
from .views import (
    UserProfileView,
    ChangePasswordView,
    UserListView,
)

app_name = 'users'


class ThrottledLoginView(LoginView):
    """Login view with brute-force protection."""
    throttle_classes = [LoginRateThrottle]


urlpatterns = [
    # Override login with throttled version (must come before include)
    path('login/', ThrottledLoginView.as_view(), name='rest_login'),
    
    # Password reset endpoints
    path('password/reset/', PasswordResetView.as_view(), name='rest_password_reset'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='rest_password_reset_confirm'),
    
    # Authentication (dj-rest-auth — remaining endpoints)
    path('', include('dj_rest_auth.urls')),
    path('registration/', include('dj_rest_auth.registration.urls')),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile management
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    # Admin
    path('users/', UserListView.as_view(), name='user-list'),
]
