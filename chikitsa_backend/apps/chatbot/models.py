"""
Chatbot models for Chikitsa.
Stores conversation history and analytics.
"""

from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

from apps.core.models import BaseModel, TimeStampedModel


class Conversation(BaseModel):
    """
    Represents a chat conversation/session.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversations',
        null=True,
        blank=True  # Allow anonymous conversations
    )
    session_id = models.CharField(max_length=100, db_index=True)
    title = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Metadata
    total_messages = models.PositiveIntegerField(default=0)
    total_tokens_used = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = _('conversation')
        verbose_name_plural = _('conversations')
        ordering = ['-updated_at']
    
    def __str__(self):
        return f'Conversation {self.session_id[:8]}'
    
    def get_messages_for_context(self, limit: int = 10):
        """Get recent messages for context."""
        return self.messages.order_by('-created_at')[:limit][::-1]


class Message(TimeStampedModel):
    """
    Individual message in a conversation.
    """
    
    class Role(models.TextChoices):
        USER = 'user', _('User')
        ASSISTANT = 'assistant', _('Assistant')
        SYSTEM = 'system', _('System')
    
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    role = models.CharField(
        max_length=10,
        choices=Role.choices
    )
    content = models.TextField()
    
    # AI Response metadata
    tokens_used = models.PositiveIntegerField(default=0)
    model_used = models.CharField(max_length=50, blank=True)
    response_time_ms = models.PositiveIntegerField(default=0)
    
    # Feedback
    is_helpful = models.BooleanField(null=True, blank=True)
    feedback_text = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _('message')
        verbose_name_plural = _('messages')
        ordering = ['created_at']
    
    def __str__(self):
        return f'{self.role}: {self.content[:50]}...'


class MedicalKnowledgeBase(TimeStampedModel):
    """
    Knowledge base entries for RAG (Retrieval-Augmented Generation).
    Medical information that the chatbot can reference.
    """
    
    class Category(models.TextChoices):
        SYMPTOM = 'symptom', _('Symptom')
        CONDITION = 'condition', _('Condition')
        MEDICATION = 'medication', _('Medication')
        PROCEDURE = 'procedure', _('Procedure')
        GENERAL = 'general', _('General Health')
    
    title = models.CharField(max_length=200)
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.GENERAL
    )
    content = models.TextField()
    source = models.CharField(max_length=200, blank=True)
    source_url = models.URLField(blank=True)
    
    # Vector embedding for similarity search
    embedding = models.JSONField(null=True, blank=True)
    
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = _('medical knowledge base')
        verbose_name_plural = _('medical knowledge bases')
        ordering = ['category', 'title']
    
    def __str__(self):
        return f'{self.category}: {self.title}'


class ChatbotFeedback(TimeStampedModel):
    """
    User feedback on chatbot responses.
    """
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='feedbacks'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    rating = models.PositiveIntegerField(help_text='1-5 rating')
    feedback_type = models.CharField(
        max_length=20,
        choices=[
            ('helpful', 'Helpful'),
            ('not_helpful', 'Not Helpful'),
            ('incorrect', 'Incorrect Information'),
            ('inappropriate', 'Inappropriate'),
        ]
    )
    comment = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _('chatbot feedback')
        verbose_name_plural = _('chatbot feedbacks')
    
    def __str__(self):
        return f'Feedback for message {self.message_id}'
