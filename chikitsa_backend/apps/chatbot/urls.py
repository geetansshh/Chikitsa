"""
URL configuration for chatbot app.
"""

from django.urls import path

from .views import (
    ChatView,
    ConversationListView,
    ConversationDetailView,
    SymptomAnalysisView,
    HealthTipView,
    ChatFeedbackView,
    QuickRepliesView,
)

app_name = 'chatbot'

urlpatterns = [
    # Main chat endpoint
    path('chat/', ChatView.as_view(), name='chat'),
    
    # Conversations
    path('conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('conversations/<uuid:pk>/', ConversationDetailView.as_view(), name='conversation-detail'),
    
    # Specialized features
    path('symptoms/analyze/', SymptomAnalysisView.as_view(), name='symptom-analysis'),
    path('health-tips/', HealthTipView.as_view(), name='health-tips'),
    path('quick-replies/', QuickRepliesView.as_view(), name='quick-replies'),
    
    # Feedback
    path('feedback/', ChatFeedbackView.as_view(), name='chat-feedback'),
]
