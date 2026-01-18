# 🚀 Quick Start Guide - Local Development

## Step 1: Prerequisites Check

Make sure you have installed:
- ✅ **Node.js** 18+ ([Download](https://nodejs.org))
- ✅ **Go** 1.21+ ([Download](https://golang.org))
- ✅ **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/windows/))

## Step 2: Run Setup Script

### Windows (PowerShell):
```powershell
.\setup-local.ps1
```

### Mac/Linux:
```bash
chmod +x setup-local.sh
./setup-local.sh
```

This will:
- Check prerequisites
- Create `.env` files
- Install all dependencies

## Step 3: Setup Database

### Option A: Using psql command line
```bash
# Create database
createdb cpool

# OR using psql
psql -U postgres
CREATE DATABASE cpool;
\q
```

### Option B: Using pgAdmin (GUI)
1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Name: `cpool`
4. Click "Save"

## Step 4: Configure Environment Variables

### Backend (`backend/.env`):
```env
PORT=8080
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/cpool?sslmode=disable
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

**Important**: Replace `YOUR_PASSWORD` with your PostgreSQL password!

### Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Step 5: Run Database Migrations

```bash
cd backend
go run cmd/migrate/main.go
```

You should see:
```
Database connection established
Database migrations completed
```

## Step 6: Start Development Servers

### Option A: Use the start script (Windows)
```powershell
.\start-dev.ps1
```

### Option B: Manual start (Two terminals)

**Terminal 1 - Backend:**
```bash
cd backend
go run main.go
```

You should see:
```
Database connection established
Database migrations completed
Server starting on port 8080
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

## Step 7: Access the Application

1. Open browser: **http://localhost:3000**
2. You should see the homepage

## Step 8: Test Login

**Admin Credentials:**
- Email: `admin@135`
- Password: `admin`

1. Click "Login" or go to http://localhost:3000/login
2. Enter credentials
3. You should be redirected to dashboard

## 🧪 Testing Checklist

- [ ] Homepage loads
- [ ] Can register new user
- [ ] Can login as admin
- [ ] Dashboard shows stats
- [ ] Can register vehicle
- [ ] Can view corridors (admin)
- [ ] Can offer ride
- [ ] Can find rides
- [ ] Chat works (HTTP polling)
- [ ] Payment tracking works

## 🐛 Troubleshooting

### Database Connection Error
```
Error: failed to connect to database
```
**Solution**: 
- Check PostgreSQL is running: `pg_isready`
- Verify password in `backend/.env`
- Check database exists: `psql -l | grep cpool`

### Port Already in Use
```
Error: listen tcp :8080: bind: address already in use
```
**Solution**: 
- Change `PORT` in `backend/.env` to another port (e.g., 8081)
- Update `NEXT_PUBLIC_API_URL` in `frontend/.env.local` accordingly

### Migration Errors
```
Error: migration failed
```
**Solution**:
- Drop and recreate database: `dropdb cpool && createdb cpool`
- Run migrations again: `go run cmd/migrate/main.go`

### Frontend Can't Connect to Backend
```
Network Error / CORS Error
```
**Solution**:
- Verify backend is running on port 8080
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Ensure backend CORS middleware is enabled

### Module Not Found Errors
```
Error: Cannot find module 'xxx'
```
**Solution**:
- Run `npm install` in `frontend/` directory
- Run `go mod download` in `backend/` directory

## 📝 Next Steps After Local Setup

1. **Test all features**:
   - Register a test user
   - Register a vehicle
   - Create a corridor (admin)
   - Assign corridor to user (admin)
   - Offer a ride
   - Request a ride
   - Test chat
   - Test payment flow

2. **Prepare for Production**:
   - See [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Set up Vercel account
   - Set up Railway account
   - Configure environment variables

## 🆘 Need Help?

- Check [SETUP.md](./SETUP.md) for detailed setup
- Check [README.md](./README.md) for project overview
- Check backend logs for errors
- Check browser console for frontend errors

---

**Happy coding! 🚗**
