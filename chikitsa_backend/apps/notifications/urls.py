"""
URL configuration for notifications app.
"""

from django.urls import path

from .views import (
    NotificationListView,
    UnreadNotificationCountView,
    MarkNotificationReadView,
    MarkAllReadView,
)

app_name = 'notifications'

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('unread-count/', UnreadNotificationCountView.as_view(), name='unread-count'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark-read'),
    path('read-all/', MarkAllReadView.as_view(), name='mark-all-read'),
]
