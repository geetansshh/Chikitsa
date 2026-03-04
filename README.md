# 🏥 Chikitsa - AI-Powered Medical Assistant Platform

> **AI-First Healthcare Platform** leveraging LLMs and LangChain for intelligent medical consultation and patient care management.

**🔗 GitHub Repository:** [INSERT_REPOSITORY_LINK_HERE]

![LangChain](https://img.shields.io/badge/LangChain-Powered-purple)
![Groq](https://img.shields.io/badge/Groq-LLM-orange)
![Django](https://img.shields.io/badge/Django-5.0-green)
![React](https://img.shields.io/badge/React-18-blue)

## 🤖 AI/ML Highlights

### LLM-Powered Medical Chatbot
- **LangChain Framework**: Built using LangChain for flexible LLM orchestration
- **Groq Integration**: Currently using Groq API with Llama 3.3 70B for fast inference
- **Context-Aware Responses**: Maintains conversation history for coherent medical guidance
- **Prompt Engineering**: Carefully crafted system prompts for medical domain expertise

### Custom Model Training (Phase 1)
Initially trained a **custom fine-tuned LLM** on medical datasets:
- Used **Unsloth** framework for efficient fine-tuning
- Fine-tuned **Llama-chatDoctor** model on medical conversation data
- 4-bit quantization for optimized inference
- Medical domain-specific instruction tuning

### Current Architecture (Phase 2)
Transitioned to **LangChain + Groq** for production deployment:
```python
# LangChain integration with Groq
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.7,
    api_key=GROQ_API_KEY
)
```

## 🎯 Key Features

### 🤖 AI Medical Assistant
- Real-time health consultation using LLM
- Context-aware conversation management
- Symptom analysis and health recommendations
- Emergency situation detection and guidance

### 🏥 Healthcare Management
- Doctor discovery and appointment booking
- Patient dashboard with health history
- Schedule management for healthcare providers
- Real-time notifications system

### 🔧 Technical Stack
**Backend:**
- Django REST Framework (API)
- LangChain (LLM orchestration)
- Groq API (LLM inference)
- PostgreSQL (Database)
- JWT Authentication

**Frontend:**
- React + TypeScript
- TanStack Query (data fetching)
- Tailwind CSS (styling)
- Zustand (state management)

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHIKITSA AI PLATFORM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐      ┌──────────┐      ┌────────────────────┐   │
│  │  React   │◄────►│  Django  │◄────►│  LangChain + Groq  │   │
│  │ Frontend │      │   API    │      │    (Llama 3.3)     │   │
│  └──────────┘      └──────────┘      └────────────────────┘   │
│                          │                                      │
│                          ▼                                      │
│              ┌──────────────────────┐                           │
│              │  PostgreSQL Database │                           │
│              └──────────────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Backend Setup
```bash
cd chikitsa_backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment variables
export GROQ_API_KEY="your_groq_api_key"
export DATABASE_URL="postgresql://user:pass@localhost/chikitsa"

python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd chikitsa_frontend
npm install
npm run dev
```

## 💡 AI Implementation Details

### LangChain Service Architecture
The chatbot service follows SOLID principles with clean abstraction:
```python
class MedicalChatbotService:
    """LangChain-based medical assistant"""
    
    def __init__(self):
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=512
        )
    
    def chat(self, message, conversation_history):
        # Context-aware medical consultation
        messages = [SystemMessage(content=self._system_prompt)]
        messages.extend(self._format_history(conversation_history))
        messages.append(HumanMessage(content=message))
        
        return self.llm.invoke(messages)
```

### Evolution: Custom Model → Production LLM
1. **Phase 1 (Research)**: Fine-tuned Llama-chatDoctor using Unsloth
   - Medical dataset training
   - 4-bit quantization for efficiency
   - Experimented with instruction tuning

2. **Phase 2 (Production)**: Migrated to LangChain + Groq
   - Better scalability and maintenance
   - Faster inference with Groq
   - Easier prompt engineering and iteration
   - No infrastructure overhead for model hosting

## 📂 Project Structure

```
chikitsa_backend/
├── apps/
│   ├── chatbot/              # 🤖 LangChain-powered AI assistant
│   │   ├── services.py       # LLM orchestration logic
│   │   ├── models.py         # Conversation & message models
│   │   └── views.py          # Chat API endpoints
│   ├── doctors/              # Doctor management
│   ├── appointments/         # Appointment system
│   └── users/                # Authentication & profiles
└── config/
    └── settings/             # Environment configurations

chikitsa_frontend/
├── src/
│   ├── pages/
│   │   └── Chat.tsx          # AI chatbot interface
│   ├── components/           # Reusable UI components
│   └── lib/                  # API client

old_code/
└── chatbot.ipynb             # Custom model training experiments
```

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ **LLM Integration**: Practical implementation of LangChain with Groq
- ✅ **Prompt Engineering**: Medical domain-specific system prompts
- ✅ **Conversation Management**: Context-aware chat with history tracking
- ✅ **Model Training**: Experience with fine-tuning (Llama + Unsloth)
- ✅ **Production Architecture**: Scalable LLM deployment strategies
- ✅ **Full-Stack Development**: End-to-end AI application development

## 🔮 Future Enhancements

- [ ] **RAG Implementation**: Add vector database for medical knowledge retrieval
- [ ] **Embeddings**: Integrate medical document embeddings
- [ ] **Multi-modal**: Add image analysis for medical reports
- [ ] **Evaluation**: Implement LLM response quality metrics
- [ ] **Fine-tuning**: Deploy custom medical model alongside Groq

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! This project showcases modern LLM application development practices.

---

**Built with** ❤️ **using LangChain, Groq, Django, and React**
