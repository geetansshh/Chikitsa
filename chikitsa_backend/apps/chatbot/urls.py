"""
URL configuration for chatbot app.
"""

from django.urls import path

from .views import ChatView

app_name = 'chatbot'

urlpatterns = [
    # Main chat endpoint
    path('chat/', ChatView.as_view(), name='chat'),
]
