"""
Views for chatbot app.
"""

import uuid
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Conversation, Message
from .serializers import ChatMessageInputSerializer
from .services import get_chatbot_service


class ChatView(APIView):
    """
    Main chat endpoint for the medical chatbot.
    """
    permission_classes = [permissions.AllowAny]  # Allow anonymous access
    
    def post(self, request):
        """
        Send a message to the chatbot and get a response.
        """
        serializer = ChatMessageInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_message = serializer.validated_data['message']
        conversation_id = serializer.validated_data.get('conversation_id')
        
        # Get or create conversation
        if conversation_id:
            try:
                conversation = Conversation.objects.get(id=conversation_id)
            except Conversation.DoesNotExist:
                conversation = self._create_conversation(request)
        else:
            conversation = self._create_conversation(request)
        
        # Save user message
        user_msg = Message.objects.create(
            conversation=conversation,
            role=Message.Role.USER,
            content=user_message
        )
        
        # Get chat history
        chat_history = [
            {'role': msg.role, 'content': msg.content}
            for msg in conversation.messages.order_by('created_at')[:20]
        ]
        
        # Get user context if authenticated
        user_context = None
        if request.user.is_authenticated:
            user_context = self._get_user_context(request.user)
        
        # Generate response
        chatbot = get_chatbot_service()
        result = chatbot.generate_response_sync(
            user_message=user_message,
            chat_history=chat_history[:-1],  # Exclude current message
            user_context=user_context
        )
        
        # Save assistant message
        assistant_msg = Message.objects.create(
            conversation=conversation,
            role=Message.Role.ASSISTANT,
            content=result['content'],
            tokens_used=result['tokens_used'],
            model_used=result['model_used'],
            response_time_ms=result['response_time_ms']
        )
        
        # Update conversation stats
        conversation.total_messages = conversation.messages.count()
        conversation.total_tokens_used += result['tokens_used']
        conversation.save(update_fields=['total_messages', 'total_tokens_used', 'updated_at'])
        
        return Response({
            'message_id': assistant_msg.id,
            'content': result['content'],
            'conversation_id': str(conversation.id),
            'tokens_used': result['tokens_used'],
            'response_time_ms': result['response_time_ms']
        }, status=status.HTTP_200_OK)
    
    def _create_conversation(self, request):
        """Create a new conversation."""
        return Conversation.objects.create(
            user=request.user if request.user.is_authenticated else None,
            session_id=str(uuid.uuid4()),
            title='New Conversation'
        )
    
    def _get_user_context(self, user):
        """Get user context for personalized responses."""
        context = {}
        
        if hasattr(user, 'date_of_birth') and user.date_of_birth:
            from apps.core.utils import calculate_age
            context['age'] = calculate_age(user.date_of_birth)
        
        if hasattr(user, 'gender') and user.gender:
            context['gender'] = user.gender
        
        return context if context else None
