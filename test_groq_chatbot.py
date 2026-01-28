"""
Test script for Groq API integration with the chatbot.

How to get Groq API Key:
1. Go to https://console.groq.com/
2. Sign up for free (they offer generous free tier)
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to .env file

Available Groq Models:
- llama-3.1-70b-versatile (Best quality, recommended)
- llama-3.1-8b-instant (Faster, good quality)
- llama-3.2-90b-text-preview (Latest, experimental)
- mixtral-8x7b-32768 (Good alternative)
"""

import os
import sys
import django

# Setup Django environment
sys.path.insert(0, '/Users/geetansh/Desktop/CHIKITSA/chikitsa_backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.chatbot.services import MedicalChatbotService

def test_groq_chatbot():
    """Test the Groq-powered chatbot."""
    
    print("=" * 60)
    print("Testing Groq API Integration")
    print("=" * 60)
    
    # Check if API key is set
    from django.conf import settings
    groq_key = settings.CHATBOT_CONFIG.get('GROQ_API_KEY')
    
    if not groq_key or groq_key == 'your_groq_api_key_here':
        print("\n❌ ERROR: Groq API key not set!")
        print("\nPlease follow these steps:")
        print("1. Visit https://console.groq.com/")
        print("2. Sign up for free account")
        print("3. Go to 'API Keys' section")
        print("4. Create a new key")
        print("5. Add it to chikitsa_backend/.env file:")
        print("   GROQ_API_KEY=gsk_your_actual_key_here")
        return
    
    print(f"\n✓ Groq API key configured")
    print(f"✓ Using model: {settings.CHATBOT_CONFIG.get('MODEL_NAME')}")
    
    # Initialize chatbot service
    chatbot = MedicalChatbotService()
    
    # Test 1: Simple medical question
    print("\n" + "=" * 60)
    print("TEST 1: Simple Medical Question")
    print("=" * 60)
    
    question = "What are the common symptoms of flu?"
    print(f"\nQuestion: {question}")
    print("\nGenerating response...")
    
    try:
        response = chatbot.generate_response_sync(
            user_message=question,
            chat_history=[],
            user_context={}
        )
        
        if response['success']:
            print(f"\n✓ Response generated in {response['response_time_ms']}ms")
            print(f"✓ Tokens used: ~{response['tokens_used']}")
            print(f"\nResponse:\n{response['content']}")
        else:
            print(f"\n✗ Error: {response.get('error')}")
    
    except Exception as e:
        print(f"\n✗ Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return
    
    # Test 2: With patient context
    print("\n" + "=" * 60)
    print("TEST 2: With Patient Context")
    print("=" * 60)
    
    question = "Should I be concerned about my fever?"
    context = {
        'age': 28,
        'gender': 'Female',
        'medical_conditions': 'None',
    }
    
    print(f"\nQuestion: {question}")
    print(f"Context: {context}")
    print("\nGenerating response...")
    
    try:
        response = chatbot.generate_response_sync(
            user_message=question,
            chat_history=[],
            user_context=context
        )
        
        if response['success']:
            print(f"\n✓ Response generated in {response['response_time_ms']}ms")
            print(f"\nResponse:\n{response['content']}")
        else:
            print(f"\n✗ Error: {response.get('error')}")
    
    except Exception as e:
        print(f"\n✗ Exception: {str(e)}")
        return
    
    # Test 3: With conversation history
    print("\n" + "=" * 60)
    print("TEST 3: With Conversation History")
    print("=" * 60)
    
    chat_history = [
        {'role': 'user', 'content': 'I have a headache and fever'},
        {'role': 'assistant', 'content': 'Those could be symptoms of various conditions including flu, common cold, or other infections. How long have you had these symptoms?'}
    ]
    question = "About 2 days now, and I feel very tired"
    
    print(f"\nQuestion: {question}")
    print("(Continuing previous conversation)")
    print("\nGenerating response...")
    
    try:
        response = chatbot.generate_response_sync(
            user_message=question,
            chat_history=chat_history,
            user_context={}
        )
        
        if response['success']:
            print(f"\n✓ Response generated in {response['response_time_ms']}ms")
            print(f"\nResponse:\n{response['content']}")
            print("\n" + "=" * 60)
            print("✅ ALL TESTS PASSED!")
            print("=" * 60)
            print("\nGroq integration is working correctly!")
            print("You can now use the chatbot in your Django backend.")
        else:
            print(f"\n✗ Error: {response.get('error')}")
    
    except Exception as e:
        print(f"\n✗ Exception: {str(e)}")
        return

if __name__ == "__main__":
    test_groq_chatbot()
