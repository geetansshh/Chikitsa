"""
URL configuration for users app.
"""

from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    UserProfileView,
    ChangePasswordView,
    PatientProfileView,
    UserListView,
)

app_name = 'users'

urlpatterns = [
    # Authentication (dj-rest-auth)
    path('', include('dj_rest_auth.urls')),
    path('registration/', include('dj_rest_auth.registration.urls')),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile management
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('profile/patient/', PatientProfileView.as_view(), name='patient-profile'),
    
    # Admin
    path('users/', UserListView.as_view(), name='user-list'),
]
