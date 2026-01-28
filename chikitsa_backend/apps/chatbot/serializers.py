"""
Serializers for chatbot app.
"""

from rest_framework import serializers
from .models import Conversation, Message, ChatbotFeedback, MedicalKnowledgeBase


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for Message model.
    """
    
    class Meta:
        model = Message
        fields = [
            'id', 'role', 'content', 'tokens_used', 'model_used',
            'response_time_ms', 'is_helpful', 'created_at'
        ]
        read_only_fields = ['id', 'tokens_used', 'model_used', 'response_time_ms', 'created_at']


class ConversationListSerializer(serializers.ModelSerializer):
    """
    Serializer for conversation list view.
    """
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'session_id', 'title', 'total_messages', 'last_message', 'created_at', 'updated_at']
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'content': last_msg.content[:100] + '...' if len(last_msg.content) > 100 else last_msg.content,
                'role': last_msg.role,
                'created_at': last_msg.created_at
            }
        return None


class ConversationDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for conversation detail view with messages.
    """
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'session_id', 'title', 'is_active',
            'total_messages', 'total_tokens_used', 'messages',
            'created_at', 'updated_at'
        ]


class ChatMessageInputSerializer(serializers.Serializer):
    """
    Serializer for chat message input.
    """
    message = serializers.CharField(max_length=4000)
    conversation_id = serializers.UUIDField(required=False, allow_null=True)


class ChatMessageOutputSerializer(serializers.Serializer):
    """
    Serializer for chat message output.
    """
    message_id = serializers.IntegerField()
    content = serializers.CharField()
    conversation_id = serializers.UUIDField()
    tokens_used = serializers.IntegerField()
    response_time_ms = serializers.IntegerField()


class SymptomAnalysisInputSerializer(serializers.Serializer):
    """
    Serializer for symptom analysis input.
    """
    symptoms = serializers.ListField(
        child=serializers.CharField(max_length=200),
        min_length=1,
        max_length=10
    )
    duration = serializers.CharField(max_length=100)
    severity = serializers.ChoiceField(choices=['mild', 'moderate', 'severe'])
    additional_info = serializers.CharField(required=False, allow_blank=True, max_length=1000)


class SymptomAnalysisOutputSerializer(serializers.Serializer):
    """
    Serializer for symptom analysis output.
    """
    analysis = serializers.CharField()
    disclaimer = serializers.CharField()


class ChatbotFeedbackSerializer(serializers.ModelSerializer):
    """
    Serializer for chatbot feedback.
    """
    
    class Meta:
        model = ChatbotFeedback
        fields = ['id', 'message', 'rating', 'feedback_type', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']


class HealthTipSerializer(serializers.Serializer):
    """
    Serializer for health tips.
    """
    category = serializers.ChoiceField(
        choices=['general', 'nutrition', 'exercise', 'mental', 'sleep'],
        default='general'
    )


class MedicalKnowledgeBaseSerializer(serializers.ModelSerializer):
    """
    Serializer for medical knowledge base entries.
    """
    
    class Meta:
        model = MedicalKnowledgeBase
        fields = ['id', 'title', 'category', 'content', 'source', 'source_url', 'created_at']
        read_only_fields = ['id', 'created_at']
