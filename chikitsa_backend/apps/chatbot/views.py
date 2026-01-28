"""
Views for chatbot app.
"""

import uuid
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from asgiref.sync import async_to_sync

from .models import Conversation, Message, ChatbotFeedback
from .serializers import (
    ConversationListSerializer,
    ConversationDetailSerializer,
    ChatMessageInputSerializer,
    ChatMessageOutputSerializer,
    SymptomAnalysisInputSerializer,
    ChatbotFeedbackSerializer,
    HealthTipSerializer,
)
from .services import get_chatbot_service, get_symptom_analyzer, get_health_tips_service


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
        
        if hasattr(user, 'patient_profile'):
            profile = user.patient_profile
            if profile.medical_conditions:
                context['medical_conditions'] = profile.medical_conditions
            if profile.allergies:
                context['allergies'] = profile.allergies
        
        return context if context else None


class ConversationListView(generics.ListAPIView):
    """
    List user's conversations.
    """
    serializer_class = ConversationListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(
            user=self.request.user,
            is_deleted=False
        ).prefetch_related('messages')


class ConversationDetailView(generics.RetrieveDestroyAPIView):
    """
    Get or delete a conversation.
    """
    serializer_class = ConversationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete the conversation."""
        instance = self.get_object()
        instance.delete()  # Uses soft delete from BaseModel
        return Response(status=status.HTTP_204_NO_CONTENT)


class SymptomAnalysisView(APIView):
    """
    Analyze symptoms and provide possible conditions.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = SymptomAnalysisInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        analyzer = get_symptom_analyzer()
        
        try:
            result = analyzer.analyze_symptoms(
                symptoms=serializer.validated_data['symptoms'],
                duration=serializer.validated_data['duration'],
                severity=serializer.validated_data['severity'],
                additional_info=serializer.validated_data.get('additional_info')
            )
            
            return Response(result, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {
                    'error': 'Failed to analyze symptoms. Please try again.',
                    'disclaimer': 'If you have concerning symptoms, please consult a healthcare professional.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HealthTipView(APIView):
    """
    Get personalized health tips.
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        category = request.query_params.get('category', 'general')
        
        tips_service = get_health_tips_service()
        
        try:
            tip = tips_service.get_daily_health_tip(category)
            
            return Response({
                'category': category,
                'tip': tip
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response(
                {'error': 'Failed to get health tip'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ChatFeedbackView(generics.CreateAPIView):
    """
    Submit feedback for a chatbot response.
    """
    serializer_class = ChatbotFeedbackSerializer
    permission_classes = [permissions.AllowAny]
    
    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user if self.request.user.is_authenticated else None
        )


class QuickRepliesView(APIView):
    """
    Get suggested quick replies based on context.
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        """Return common health-related quick replies."""
        quick_replies = [
            {"text": "Common cold symptoms", "value": "What are the symptoms of a common cold?"},
            {"text": "Headache remedies", "value": "What are some home remedies for headache?"},
            {"text": "When to see a doctor", "value": "When should I see a doctor?"},
            {"text": "Healthy diet tips", "value": "Can you give me some healthy diet tips?"},
            {"text": "Sleep improvement", "value": "How can I improve my sleep quality?"},
            {"text": "Stress management", "value": "What are some stress management techniques?"},
        ]
        
        return Response({'quick_replies': quick_replies})
