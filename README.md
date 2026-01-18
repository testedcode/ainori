# 🚗 cpool.ai - Car Pooling System

A corridor-based car pooling web application for office and daily commute, starting with Mumbai.

## 🎯 Features

- **Corridor-based rides**: Admin-controlled corridors for organized ride sharing
- **City management**: Mumbai (active), Pune & Bangalore (locked for future)
- **User roles**: Normal users and Admin with full control
- **Vehicle registration**: Mandatory for ride givers
- **Ride management**: Offer rides, request rides, accept/reject requests
- **In-ride chat**: HTTP polling-based messaging system
- **Payment tracking**: QR code + UPI ID display with status tracking
- **Carbon credits**: Earn credits on ride completion
- **Admin panel**: Full system management
- **Maps integration**: OpenStreetMap + Leaflet (Phase 1)
- **AI features**: Showcase AI-powered features

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (for beautiful UI)
- **Shadcn/ui** (component library)
- **Leaflet** (maps)

### Backend
- **Go (Golang)**
- **Gin** (web framework)
- **PostgreSQL** (database)
- **JWT** (authentication)

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Vercel Postgres / Supabase / Neon (free tier)

## 📁 Project Structure

```
cpool.ai/
├── frontend/          # Next.js application
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities and API clients
│   └── public/       # Static assets
├── backend/          # Go API server
│   ├── cmd/         # Application entry point
│   ├── internal/    # Internal packages
│   │   ├── auth/    # Authentication
│   │   ├── models/  # Data models
│   │   ├── handlers/# API handlers
│   │   └── db/      # Database layer
│   └── migrations/  # Database migrations
└── docs/            # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Go 1.21+
- PostgreSQL (or use free tier: Supabase/Neon/Vercel Postgres)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/testedcode/cpool.ai.git
   cd cpool.ai
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**

   Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

   Create `backend/.env`:
   ```env
   PORT=8080
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=cpool
   JWT_SECRET=your_jwt_secret_key_change_in_production
   ```

4. **Set up database**
   ```bash
   cd backend
   go run cmd/migrate/main.go
   ```

5. **Start backend server**
   ```bash
   npm run backend
   # or
   cd backend && go run main.go
   ```

6. **Start frontend (in another terminal)**
   ```bash
   npm run dev
   # or
   cd frontend && npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

### Default Admin Credentials

- Email: `admin@135`
- Password: `admin`

⚠️ **Change these in production!**

## 📦 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL
4. Deploy

### Backend (Railway)

1. Create new project on Railway
2. Connect GitHub repository
3. Add PostgreSQL service
4. Set environment variables in Railway dashboard
5. Deploy

### Database Setup

For free PostgreSQL options:
- **Vercel Postgres**: Integrated with Vercel
- **Supabase**: Free tier with 500MB
- **Neon**: Free tier with 3GB

## 🔐 Authentication

Currently using custom authentication. Google OAuth can be added later.

## 📝 API Documentation

API endpoints will be documented at `/api/docs` (to be implemented)

## 🤝 Contributing

This is a private project. For contributions, please contact the maintainer.

## 📄 License

MIT License

## 🆘 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for sustainable commuting

