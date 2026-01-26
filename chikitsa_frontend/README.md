# Chikitsa Frontend

Modern React frontend for the Chikitsa healthcare platform.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Query** - Server state management
- **Zustand** - Client state management
- **React Router** - Client-side routing
- **Framer Motion** - Animations
- **Headless UI** - Accessible UI components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Configure environment:
   - Update `VITE_API_URL` to point to your backend API

### Development

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Build

```bash
npm run build
```

Build output will be in the `dist` folder.

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── components/         # Reusable components
│   ├── auth/          # Authentication components
│   ├── layout/        # Layout components (Header, Footer)
│   └── ui/            # UI primitives (Button, Card, Input, etc.)
├── lib/               # Utilities and API client
├── pages/             # Page components
│   └── auth/          # Authentication pages
└── stores/            # Zustand stores
```

## Features

- 🔐 **Authentication** - Login, Register, Protected routes
- 🏥 **Doctor Search** - Browse and filter doctors by specialty, location
- 📅 **Appointments** - Book, manage, and cancel appointments
- 💬 **AI Chat** - Health assistant powered by LangChain
- 📊 **Dashboard** - Patient dashboard with stats and quick actions
- 🔔 **Notifications** - Real-time notifications
- 📱 **Responsive** - Mobile-first design

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api/v1` |

## Backend Integration

This frontend is designed to work with the Chikitsa Django REST Framework backend. Make sure the backend is running and CORS is properly configured.

## License

MIT
