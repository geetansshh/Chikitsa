"""
LangChain service for the medical chatbot.
Implements the core AI functionality using LangChain.

This follows SOLID principles:
- Single Responsibility: Each class handles one concern
- Open/Closed: Easy to extend with new chains/tools
- Liskov Substitution: Different LLM providers can be swapped
- Interface Segregation: Clean interfaces for different operations
- Dependency Inversion: Depends on abstractions (LangChain base classes)
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import time
import os
import asyncio

from django.conf import settings
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder, PromptTemplate
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

logger = logging.getLogger(__name__)


class MedicalChatbotService:
    """
    Main chatbot service using LangChain.
    Provides medical assistance and health information.
    """
    
    def __init__(self):
        self.model_name = settings.CHATBOT_CONFIG.get('MODEL_NAME', 'llama-3.1-70b-versatile')
        self.temperature = settings.CHATBOT_CONFIG.get('TEMPERATURE', 0.7)
        self.max_tokens = settings.CHATBOT_CONFIG.get('MAX_TOKENS', 512)
        self.use_groq = settings.CHATBOT_CONFIG.get('USE_GROQ', True)
        
        self._llm = None
        self._system_prompt = self._get_system_prompt()
    
    @property
    def llm(self):
        """Lazy initialization of LLM."""
        if self._llm is None:
            if self.use_groq:
                # Use Groq for fast inference with Llama models
                groq_api_key = settings.CHATBOT_CONFIG.get('GROQ_API_KEY', 
                                                             os.environ.get('GROQ_API_KEY'))
                self._llm = ChatGroq(
                    model=self.model_name,
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                    api_key=groq_api_key,
                )
            else:
                # Fallback to OpenAI
                self._llm = ChatOpenAI(
                    model=self.model_name,
                    temperature=self.temperature,
                    max_tokens=self.max_tokens,
                    api_key=settings.OPENAI_API_KEY,
                )
        return self._llm
    
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for the medical chatbot."""
        return """You are Chikitsa AI, an advanced medical assistant developed to provide helpful health information and guidance.

## Your Capabilities:
- Provide general health information and wellness advice
- Explain medical conditions, symptoms, and treatments in simple terms
- Offer lifestyle and preventive health recommendations
- Help users understand when they should seek professional medical care
- Provide first-aid guidance for common situations
- Answer questions about medications (general information only)
- Suggest questions to ask healthcare providers

## Important Guidelines:
1. **Always recommend professional consultation**: For any serious symptoms or concerns, always advise users to consult a healthcare professional.
2. **No diagnosis**: Never provide specific diagnoses. You can discuss possibilities but always emphasize the need for proper medical evaluation.
3. **No prescription advice**: Don't recommend specific medications or dosages. Only provide general information.
4. **Emergency awareness**: If someone describes symptoms of a medical emergency (chest pain, difficulty breathing, severe bleeding, etc.), immediately advise them to call emergency services or go to the nearest emergency room.
5. **Be empathetic**: Health concerns can be stressful. Be understanding and supportive in your responses.
6. **Be accurate**: Only provide information you're confident about. If unsure, say so.
7. **Cultural sensitivity**: Be respectful of different cultural perspectives on health and medicine.

## Response Format:
- Be clear and concise
- Use bullet points for lists
- Break down complex information into digestible parts
- Provide actionable advice when appropriate
- End with a reminder to consult professionals for personalized medical advice

Remember: You are a health information assistant, not a replacement for professional medical care."""
    
    def _format_chat_history(self, messages: List[Dict[str, str]]) -> List:
        """Format chat history into LangChain message objects."""
        formatted = []
        for msg in messages:
            if msg['role'] == 'user':
                formatted.append(HumanMessage(content=msg['content']))
            elif msg['role'] == 'assistant':
                formatted.append(AIMessage(content=msg['content']))
        return formatted
    
    def _build_user_context_message(self, user_context: Dict[str, Any]) -> str:
        """Build context message from user information."""
        parts = ["User Context:"]
        
        if user_context.get('age'):
            parts.append(f"- Age: {user_context['age']} years")
        if user_context.get('gender'):
            parts.append(f"- Gender: {user_context['gender']}")
        if user_context.get('medical_conditions'):
            parts.append(f"- Known conditions: {user_context['medical_conditions']}")
        if user_context.get('allergies'):
            parts.append(f"- Allergies: {user_context['allergies']}")
        
        if len(parts) > 1:
            return "\n".join(parts)
        return ""
    
    async def generate_response(
        self,
        user_message: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a response to the user's message.
        
        Args:
            user_message: The user's input message
            chat_history: Previous conversation messages
            user_context: User profile information (age, conditions, etc.)
        
        Returns:
            Dictionary containing response and metadata
        """
        start_time = time.time()
        
        try:
            # Use chat-based approach for Groq/OpenAI
            messages = [SystemMessage(content=self._system_prompt)]
            
            if user_context:
                context_msg = self._build_user_context_message(user_context)
                if context_msg:
                    messages.append(SystemMessage(content=context_msg))
            
            if chat_history:
                messages.extend(self._format_chat_history(chat_history[-10:]))
            
            messages.append(HumanMessage(content=user_message))
            response = await self.llm.ainvoke(messages)
            response_text = response.content
            
            response_time_ms = int((time.time() - start_time) * 1000)
            
            # Estimate tokens
            tokens_used = len(user_message.split()) + len(response_text.split()) + 100
            
            return {
                'content': response_text,
                'tokens_used': tokens_used,
                'model_used': self.model_name,
                'response_time_ms': response_time_ms,
                'success': True
            }
        
        except Exception as e:
            logger.error(f"Error generating chatbot response: {str(e)}")
            return {
                'content': "I apologize, but I'm experiencing technical difficulties. Please try again in a moment. If you have an urgent health concern, please contact a healthcare provider directly.",
                'tokens_used': 0,
                'model_used': self.model_name,
                'response_time_ms': int((time.time() - start_time) * 1000),
                'success': False,
                'error': str(e)
            }
    
    def generate_response_sync(
        self,
        user_message: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Synchronous version of generate_response.
        """
        start_time = time.time()
        
        try:
            messages = [SystemMessage(content=self._system_prompt)]
            
            if user_context:
                context_msg = self._build_user_context_message(user_context)
                if context_msg:
                    messages.append(SystemMessage(content=context_msg))
            
            if chat_history:
                messages.extend(self._format_chat_history(chat_history[-10:]))
            
            messages.append(HumanMessage(content=user_message))
            response = self.llm.invoke(messages)
            response_text = response.content
            
            response_time_ms = int((time.time() - start_time) * 1000)
            tokens_used = len(user_message.split()) + len(response_text.split()) + 100
            
            return {
                'content': response_text,
                'tokens_used': tokens_used,
                'model_used': self.model_name,
                'response_time_ms': response_time_ms,
                'success': True
            }
        
        except Exception as e:
            logger.error(f"Error generating chatbot response: {str(e)}")
            return {
                'content': "I apologize, but I'm experiencing technical difficulties. Please try again.",
                'tokens_used': 0,
                'model_used': self.model_name,
                'response_time_ms': int((time.time() - start_time) * 1000),
                'success': False,
                'error': str(e)
            }
    
    def _build_user_context_message(self, user_context: Dict[str, Any]) -> str:
        """Build context message from user information."""
        parts = ["User Context:"]
        
        if user_context.get('age'):
            parts.append(f"- Age: {user_context['age']} years")
        if user_context.get('gender'):
            parts.append(f"- Gender: {user_context['gender']}")
        if user_context.get('medical_conditions'):
            parts.append(f"- Known conditions: {user_context['medical_conditions']}")
        if user_context.get('allergies'):
            parts.append(f"- Allergies: {user_context['allergies']}")
        
        if len(parts) > 1:
            return "\n".join(parts)
        return ""


class SymptomAnalyzerService:
    """
    Specialized service for symptom analysis.
    Uses a structured approach to gather and analyze symptoms.
    """
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model='gpt-4-turbo-preview',
            temperature=0.3,  # Lower temperature for more consistent analysis
            api_key=settings.OPENAI_API_KEY,
        )
    
    def analyze_symptoms(
        self,
        symptoms: List[str],
        duration: str,
        severity: str,
        additional_info: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze symptoms and provide possible conditions.
        
        Returns structured information about possible conditions,
        urgency level, and recommended actions.
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a medical symptom analyzer. Analyze the given symptoms and provide:
1. Possible conditions (with confidence levels: likely, possible, unlikely)
2. Urgency level (emergency, urgent, routine, self-care)
3. Recommended actions
4. Red flags to watch for
5. Suggested questions for a doctor visit

IMPORTANT: Always emphasize that this is informational only and not a diagnosis.
Format your response as structured JSON."""),
            ("human", """Analyze these symptoms:
Symptoms: {symptoms}
Duration: {duration}
Severity: {severity}
Additional Info: {additional_info}""")
        ])
        
        chain = prompt | self.llm | StrOutputParser()
        
        result = chain.invoke({
            'symptoms': ', '.join(symptoms),
            'duration': duration,
            'severity': severity,
            'additional_info': additional_info or 'None provided'
        })
        
        return {
            'analysis': result,
            'disclaimer': 'This analysis is for informational purposes only and does not constitute medical advice. Please consult a healthcare professional for proper diagnosis and treatment.'
        }


class HealthTipsService:
    """
    Service for generating personalized health tips.
    """
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model='gpt-3.5-turbo',  # Faster model for tips
            temperature=0.8,
            api_key=settings.OPENAI_API_KEY,
        )
    
    def get_daily_health_tip(self, category: str = 'general') -> str:
        """Get a daily health tip in the specified category."""
        categories = {
            'general': 'general wellness and health',
            'nutrition': 'healthy eating and nutrition',
            'exercise': 'physical fitness and exercise',
            'mental': 'mental health and stress management',
            'sleep': 'sleep hygiene and rest',
        }
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a health and wellness expert. Provide practical, actionable health tips."),
            ("human", f"Give me one helpful health tip about {categories.get(category, 'general health')}. Keep it concise (2-3 sentences) and actionable.")
        ])
        
        chain = prompt | self.llm | StrOutputParser()
        
        return chain.invoke({})


# Singleton instances
_chatbot_service = None
_symptom_analyzer = None
_health_tips_service = None


def get_chatbot_service() -> MedicalChatbotService:
    """Get or create the chatbot service singleton."""
    global _chatbot_service
    if _chatbot_service is None:
        _chatbot_service = MedicalChatbotService()
    return _chatbot_service


def get_symptom_analyzer() -> SymptomAnalyzerService:
    """Get or create the symptom analyzer singleton."""
    global _symptom_analyzer
    if _symptom_analyzer is None:
        _symptom_analyzer = SymptomAnalyzerService()
    return _symptom_analyzer


def get_health_tips_service() -> HealthTipsService:
    """Get or create the health tips service singleton."""
    global _health_tips_service
    if _health_tips_service is None:
        _health_tips_service = HealthTipsService()
    return _health_tips_service
