# Chikitsa - AI-Powered Medical Assistant

**GitHub Repository:** https://github.com/geetansshh/Chikitsa

## Overview

Chikitsa is a full-stack healthcare platform that demonstrates practical implementation of Large Language Models in a production environment. The platform combines an AI-powered medical chatbot with a complete appointment management system for doctors and patients.

## AI/ML Implementation

### LangChain Integration
The core of this project is an intelligent medical assistant built using LangChain framework. It leverages Groq's API to run Llama 3.3 70B for fast, context-aware medical consultations.

**Key Technical Features:**
- Conversation history management for contextual responses
- Custom medical domain prompts for accurate health guidance
- Structured message handling with LangChain's message system
- Clean service architecture following SOLID principles

### Model Training Journey

The project evolved through two distinct phases:

**Phase 1 - Custom Model Training:**
Initially, I fine-tuned a custom LLM using the Unsloth framework on medical conversation datasets. The approach included:
- Fine-tuning Llama-chatDoctor model
- 4-bit quantization for efficient inference
- Medical domain-specific instruction tuning
- Experimentation with various training techniques

**Phase 2 - Production Deployment:**
Transitioned to LangChain + Groq for scalability and maintenance benefits:
- Faster inference with Groq's infrastructure
- Easier prompt engineering and iteration
- No model hosting overhead
- Better production reliability

## Technical Architecture

**Backend:**
- Django REST Framework for API layer
- LangChain for LLM orchestration
- Groq API for model inference
- PostgreSQL for data persistence
- JWT-based authentication

**Frontend:**
- React with TypeScript
- TanStack Query for server state
- Tailwind CSS for styling
- Zustand for client state management

## Implementation Highlights

The medical chatbot service is structured for maintainability:

```python
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

class MedicalChatbotService:
    def __init__(self):
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=512
        )
    
    def chat(self, message, conversation_history):
        messages = [SystemMessage(content=self._system_prompt)]
        messages.extend(self._format_history(conversation_history))
        messages.append(HumanMessage(content=message))
        return self.llm.invoke(messages)
```

## Project Structure

```
chikitsa_backend/
├── apps/
│   ├── chatbot/          # LangChain-powered AI assistant
│   │   ├── services.py   # LLM orchestration logic
│   │   ├── models.py     # Conversation models
│   │   └── views.py      # API endpoints
│   ├── doctors/          # Doctor management
│   ├── appointments/     # Booking system
│   └── users/            # Authentication

chikitsa_frontend/
├── src/
│   ├── pages/            # React pages
│   ├── components/       # UI components
│   └── lib/              # API client

old_code/
└── chatbot.ipynb         # Custom model training experiments
```

## Key Learning Outcomes

This project demonstrates:
- Practical LLM integration in production applications
- LangChain framework implementation
- Prompt engineering for domain-specific use cases
- Model fine-tuning experience with Unsloth
- Full-stack development with AI components
- Clean architecture for LLM services

## Future Roadmap

- RAG implementation with vector databases for medical knowledge retrieval
- Integration of medical document embeddings
- Multi-modal support for analyzing medical reports and images
- LLM response quality evaluation metrics
- Deployment of custom fine-tuned model alongside Groq

## Quick Start

```bash
# Backend
cd chikitsa_backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export GROQ_API_KEY="your_api_key"
python manage.py migrate
python manage.py runserver

# Frontend
cd chikitsa_frontend
npm install
npm run dev
```

## Repository

Full source code and documentation: https://github.com/geetansshh/Chikitsa

---

Built using LangChain, Groq, Django, and React
