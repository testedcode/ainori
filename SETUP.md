# Local Development Setup Guide

## Quick Start

### 1. Prerequisites

Install the following:
- **Node.js** 18+ and npm
- **Go** 1.21+
- **PostgreSQL** 14+ (or use Docker)

### 2. Database Setup

#### Option A: Local PostgreSQL

```bash
# Create database
createdb cpool

# Or using psql
psql -U postgres
CREATE DATABASE cpool;
```

#### Option B: Docker PostgreSQL

```bash
docker run --name cpool-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cpool \
  -p 5432:5432 \
  -d postgres:14
```

### 3. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgres://postgres:postgres@localhost:5432/cpool?sslmode=disable
# JWT_SECRET=your-secret-key-here
# PORT=8080

# Install dependencies
go mod download

# Run migrations
go run cmd/migrate/main.go

# Start server
go run main.go
```

Backend will run on `http://localhost:8080`

### 4. Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 5. Default Login Credentials

- **Email**: `admin@135`
- **Password**: `admin`

⚠️ **Change these in production!**

## Project Structure

```
cpool.ai/
├── frontend/              # Next.js frontend
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and API
│   └── public/           # Static assets
├── backend/              # Go backend
│   ├── cmd/             # CLI commands
│   ├── internal/        # Internal packages
│   │   ├── auth/        # Authentication
│   │   ├── handlers/    # API handlers
│   │   ├── models/      # Data models
│   │   ├── db/          # Database layer
│   │   └── middleware/  # Middleware
│   └── main.go          # Entry point
└── docs/                 # Documentation
```

## Development Workflow

1. **Start Database**: Ensure PostgreSQL is running
2. **Start Backend**: `cd backend && go run main.go`
3. **Start Frontend**: `cd frontend && npm run dev`
4. **Access App**: Open `http://localhost:3000`

## Common Tasks

### Run Migrations
```bash
cd backend
go run cmd/migrate/main.go
```

### Reset Database
```bash
# Drop and recreate database
dropdb cpool && createdb cpool
go run cmd/migrate/main.go
```

### Check Backend Health
```bash
curl http://localhost:8080/api/health
```

### Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@135","password":"admin"}'
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check connection string in `.env`
- Ensure database exists: `psql -l | grep cpool`

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: Change port: `npm run dev -- -p 3001`

### CORS Errors
- Verify `NEXT_PUBLIC_API_URL` matches backend URL
- Check backend CORS middleware is enabled

### Migration Errors
- Ensure database is empty or drop/recreate
- Check migration SQL syntax
- Verify foreign key constraints

## Next Steps

1. Register a test user
2. Register a vehicle
3. Create a corridor (admin only)
4. Assign corridor to user (admin only)
5. Offer a ride
6. Request a ride
7. Test payment flow
8. Test chat functionality

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

