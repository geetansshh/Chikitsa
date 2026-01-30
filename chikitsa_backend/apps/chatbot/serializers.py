"""
Serializers for chatbot app.
"""

from rest_framework import serializers


class ChatMessageInputSerializer(serializers.Serializer):
    """
    Serializer for chat message input.
    """
    message = serializers.CharField(max_length=4000)
    conversation_id = serializers.UUIDField(required=False, allow_null=True)
