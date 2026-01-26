# 🏥 Chikitsa - AI-Powered Healthcare Platform

A modern, full-stack healthcare platform built with Django REST Framework and React, featuring AI-powered health assistance, doctor appointments, and comprehensive patient management.

![Chikitsa](https://img.shields.io/badge/Chikitsa-Healthcare-blue)
![Django](https://img.shields.io/badge/Django-5.0-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![LangChain](https://img.shields.io/badge/LangChain-AI-purple)

## ✨ Features

### For Patients
- 🤖 **AI Health Assistant** - Get instant health insights powered by GPT-4 and LangChain
- 🔍 **Doctor Search** - Find doctors by specialty, location, and availability
- 📅 **Appointment Booking** - Easy online booking with real-time availability
- 📊 **Health Dashboard** - Track appointments, conversations, and health journey
- 🔔 **Notifications** - Appointment reminders and updates

### For Doctors
- 📋 **Profile Management** - Showcase qualifications, experience, and fees
- 🗓️ **Schedule Management** - Set availability and manage leaves
- 📈 **Analytics Dashboard** - View patient stats and appointment trends
- ⭐ **Reviews** - Build reputation with patient reviews

### Platform Features
- 🔐 **Secure Authentication** - JWT-based auth with role-based access
- 📱 **Responsive Design** - Works seamlessly on all devices
- ⚡ **Real-time Updates** - Celery-powered background tasks
- 📖 **API Documentation** - Swagger/OpenAPI docs

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CHIKITSA PLATFORM                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │   React     │    │   Django    │    │   OpenAI    │    │
│  │  Frontend   │◄──►│   REST API  │◄──►│  LangChain  │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│                            │                               │
│                            ▼                               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │ PostgreSQL  │    │    Redis    │    │   Celery    │    │
│  │  Database   │    │    Cache    │    │   Workers   │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Django 5.0** - Web framework
- **Django REST Framework** - API layer
- **PostgreSQL** - Database
- **Redis** - Caching and message broker
- **Celery** - Async task queue
- **LangChain + OpenAI** - AI chatbot
- **JWT** - Authentication

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Query** - Server state
- **Zustand** - Client state
- **Framer Motion** - Animations

## 📁 Project Structure

```
CHIKITSA/
├── chikitsa_backend/           # Django backend
│   ├── apps/
│   │   ├── core/              # Base models, utilities
│   │   ├── users/             # Authentication, profiles
│   │   ├── doctors/           # Doctor management
│   │   ├── appointments/      # Appointment system
│   │   ├── chatbot/           # AI assistant
│   │   ├── notifications/     # Notification system
│   │   └── analytics/         # Dashboards
│   ├── config/
│   │   ├── settings/          # Environment settings
│   │   └── urls.py            # URL routing
│   ├── manage.py
│   └── requirements.txt
│
├── chikitsa_frontend/          # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── stores/            # State management
│   │   └── lib/               # API client
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd chikitsa_backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Seed sample data:**
   ```bash
   python manage.py seed_data
   ```

7. **Start development server:**
   ```bash
   python manage.py runserver
   ```

8. **Start Celery worker (separate terminal):**
   ```bash
   celery -A config worker -l INFO
   ```

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd chikitsa_frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   Navigate to http://localhost:5173

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login/` | User login |
| POST | `/api/v1/auth/registration/` | User registration |
| POST | `/api/v1/auth/logout/` | User logout |
| GET | `/api/v1/auth/profile/` | Get user profile |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/doctors/` | List doctors |
| GET | `/api/v1/doctors/{id}/` | Doctor details |
| GET | `/api/v1/doctors/{id}/availability/` | Check availability |
| GET | `/api/v1/doctors/specialties/` | List specialties |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/appointments/` | List appointments |
| POST | `/api/v1/appointments/` | Create appointment |
| POST | `/api/v1/appointments/{id}/cancel/` | Cancel appointment |
| GET | `/api/v1/appointments/upcoming/` | Upcoming appointments |

### Chatbot
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chatbot/chat/` | Send message |
| GET | `/api/v1/chatbot/conversations/` | List conversations |
| POST | `/api/v1/chatbot/symptoms/analyze/` | Analyze symptoms |

📖 **Full API Documentation:** http://localhost:8000/api/docs/

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgres://user:pass@localhost:5432/chikitsa

# OpenAI
OPENAI_API_KEY=your-openai-key

# Redis
REDIS_URL=redis://localhost:6379/0
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## 🧪 Testing

### Backend Tests
```bash
cd chikitsa_backend
pytest
```

### Frontend Tests
```bash
cd chikitsa_frontend
npm run test
```

## 🚢 Deployment

### Docker (Recommended)
```bash
docker-compose up -d
```

### Manual Deployment
1. Set environment to production
2. Configure PostgreSQL and Redis
3. Run migrations
4. Collect static files
5. Use Gunicorn + Nginx

## 📈 Future Enhancements

- [ ] Video consultations
- [ ] Prescription management
- [ ] Medical records storage
- [ ] Payment integration
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Geetansh** - [GitHub Profile](https://github.com/geetansh)

---

⭐ **Star this repo** if you find it helpful!
