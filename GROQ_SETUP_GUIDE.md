# Groq API Integration - Setup Guide

## ✅ What We Changed

Successfully migrated the chatbot from custom HuggingFace model to **Groq API** for faster, more reliable inference.

### Files Modified:

1. **services.py** - Switched from HuggingFaceHub to ChatGroq
2. **requirements.txt** - Added `langchain-groq>=0.1.0`
3. **base.py** - Updated CHATBOT_CONFIG for Groq
4. **.env** - Added GROQ_API_KEY configuration

---

## 🚀 Quick Start - Get Your FREE Groq API Key

### Step 1: Sign Up (Free!)
1. Go to: **https://console.groq.com/**
2. Click "Sign Up" (Google/GitHub login available)
3. Complete registration

### Step 2: Get API Key
1. After login, click **"API Keys"** in left sidebar
2. Click **"Create API Key"**
3. Give it a name (e.g., "Chikitsa Chatbot")
4. Click **"Create"**
5. **Copy the key** (starts with `gsk_...`)

### Step 3: Add to .env File
Open `chikitsa_backend/.env` and update:

```bash
GROQ_API_KEY=gsk_your_actual_key_here  # Replace with your key
```

---

## 🧪 Test the Integration

Run the test script:

```bash
cd /Users/geetansh/Desktop/CHIKITSA
/Users/geetansh/Desktop/CHIKITSA/venv/bin/python test_groq_chatbot.py
```

This will test:
- ✓ Simple medical questions
- ✓ Questions with patient context
- ✓ Conversation history

---

## 📊 Available Groq Models

You can change the model in `.env`:

```bash
# Best quality (recommended) - 70B parameters
CHATBOT_MODEL=llama-3.1-70b-versatile

# Fastest - 8B parameters
CHATBOT_MODEL=llama-3.1-8b-instant

# Latest experimental - 90B parameters
CHATBOT_MODEL=llama-3.2-90b-text-preview

# Alternative - Mixtral
CHATBOT_MODEL=mixtral-8x7b-32768
```

---

## 🎯 Why Groq?

**Advantages over custom HuggingFace model:**

✅ **No memory issues** - Runs on Groq's servers
✅ **Super fast** - Groq LPU™ inference (up to 10x faster)
✅ **Free tier** - Generous free quota
✅ **No local GPU needed** - Works on any machine
✅ **Reliable** - Production-ready infrastructure
✅ **Multiple models** - Easy to switch between Llama variants

**What we avoided:**
- ❌ 9GB model download
- ❌ Out of memory errors
- ❌ Slow inference on CPU
- ❌ HuggingFace Inference API limitations

---

## 🔧 Integration Details

### How it works:

```python
from langchain_groq import ChatGroq

# Automatically uses Groq API
llm = ChatGroq(
    model="llama-3.1-70b-versatile",
    temperature=0.7,
    max_tokens=512,
    api_key=settings.CHATBOT_CONFIG['GROQ_API_KEY']
)

# Same LangChain interface as before
response = await llm.ainvoke(messages)
```

### Fallback to OpenAI:

Set in `.env`:
```bash
USE_GROQ=false
OPENAI_API_KEY=your_openai_key
```

---

## 📝 Next Steps

1. **Get Groq API key** from https://console.groq.com/
2. **Add to .env** file
3. **Run test script** to verify
4. **Start Django server** and test via frontend
5. **Monitor usage** at Groq console

---

## 💡 Groq Free Tier Limits

- **Rate Limits:** 30 requests/minute
- **Token Limits:** ~14,000 tokens/minute
- **More than enough** for development and small apps

For production with higher traffic, check Groq's pricing (still very affordable).

---

## 🐛 Troubleshooting

**Error: "API key not set"**
- Add your actual Groq API key to `.env` file

**Error: "Rate limit exceeded"**
- Wait 1 minute and retry
- Consider upgrading Groq plan for production

**Error: "Model not found"**
- Check model name spelling in `.env`
- Verify model is available on Groq

---

## ✨ Summary

Your chatbot now uses **Groq's ultra-fast LLM inference** instead of trying to load a 9GB model locally. This solves:

- Memory issues ✓
- Inference API problems ✓
- Platform compatibility ✓
- Performance concerns ✓

**Just get your free Groq API key and you're ready to go!**
