# 🪟 Windows Local Setup Guide

## Step-by-Step Instructions for Windows

### Step 1: Install Prerequisites

1. **Node.js** (18+)
   - Download from: https://nodejs.org
   - Install with default options
   - Verify: Open PowerShell and run `node --version`

2. **Go** (1.21+)
   - Download from: https://golang.org/dl/
   - Install with default options
   - Verify: Open PowerShell and run `go version`

3. **PostgreSQL** (14+)
   - Download from: https://www.postgresql.org/download/windows/
   - Install with default options
   - Remember your PostgreSQL password!
   - Verify: Open PowerShell and run `psql --version`

### Step 2: Clone/Setup Project

If you haven't already:
```powershell
cd C:\Users\abhi8\Desktop\ainori
```

### Step 3: Create Environment Files

**Backend:**
```powershell
cd backend
Copy-Item .env.example .env
notepad .env
```

Edit `backend\.env`:
```env
PORT=8080
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/cpool?sslmode=disable
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

**Replace `YOUR_PASSWORD` with your PostgreSQL password!**

**Frontend:**
```powershell
cd ..\frontend
Copy-Item .env.local.example .env.local
notepad .env.local
```

Edit `frontend\.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### Step 4: Setup Database

**Option A: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Name: `cpool`
4. Click "Save"

**Option B: Using PowerShell**
```powershell
# Set PostgreSQL password (replace with your password)
$env:PGPASSWORD="your_password"

# Create database
psql -U postgres -c "CREATE DATABASE cpool;"

# Verify
psql -U postgres -l | Select-String "cpool"
```

### Step 5: Install Dependencies

**Frontend:**
```powershell
cd frontend
npm install
```

**Backend:**
```powershell
cd ..\backend
go mod download
```

### Step 6: Run Migrations

```powershell
cd backend
go run cmd/migrate/main.go
```

You should see:
```
Database connection established
Database migrations completed
```

### Step 7: Start Servers

**Terminal 1 - Backend:**
```powershell
cd backend
go run main.go
```

Wait for: `Server starting on port 8080`

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

Wait for: `Local: http://localhost:3000`

### Step 8: Test Application

1. Open browser: **http://localhost:3000**
2. Click "Login"
3. Use admin credentials:
   - Email: `admin@135`
   - Password: `admin`

### Step 9: Quick Test Flow

1. ✅ Login as admin
2. ✅ Go to Dashboard
3. ✅ Register a vehicle (Vehicles → Add Vehicle)
4. ✅ Go to Admin panel → Create/View corridors
5. ✅ Assign corridor to yourself (Admin → Corridors)
6. ✅ Offer a ride (Offer Ride)
7. ✅ Find rides (Find Ride)
8. ✅ View ride details and test chat

## 🐛 Common Issues & Solutions

### Issue: "psql: command not found"
**Solution**: Add PostgreSQL to PATH
1. Find PostgreSQL install location (usually `C:\Program Files\PostgreSQL\14\bin`)
2. Add to System PATH:
   - Right-click "This PC" → Properties → Advanced System Settings
   - Environment Variables → System Variables → Path → Edit
   - Add PostgreSQL bin folder path
   - Restart PowerShell

### Issue: "Database connection failed"
**Solution**: 
- Check PostgreSQL is running: `Get-Service postgresql*`
- Verify password in `backend\.env`
- Check database exists: `psql -U postgres -l`

### Issue: "Port 8080 already in use"
**Solution**: 
- Change port in `backend\.env` to `8081`
- Update `frontend\.env.local` to `http://localhost:8081/api`

### Issue: "Module not found"
**Solution**:
```powershell
# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules
npm install

# Backend
cd backend
go mod tidy
go mod download
```

### Issue: "Cannot find .env file"
**Solution**: Make sure you're in the correct directory:
```powershell
# Check current directory
Get-Location

# Navigate to project root
cd C:\Users\abhi8\Desktop\ainori
```

## 📋 Quick Commands Reference

```powershell
# Start backend
cd backend
go run main.go

# Start frontend
cd frontend
npm run dev

# Run migrations
cd backend
go run cmd/migrate/main.go

# Reset database (WARNING: Deletes all data!)
psql -U postgres -c "DROP DATABASE cpool;"
psql -U postgres -c "CREATE DATABASE cpool;"
cd backend
go run cmd/migrate/main.go
```

## ✅ Verification Checklist

- [ ] Node.js installed (`node --version`)
- [ ] Go installed (`go version`)
- [ ] PostgreSQL installed (`psql --version`)
- [ ] Database `cpool` created
- [ ] `backend\.env` configured
- [ ] `frontend\.env.local` configured
- [ ] Dependencies installed
- [ ] Migrations run successfully
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can login as admin

## 🎯 Next Steps

Once local setup works:
1. Test all features
2. Read [VERCEL_SETUP.md](./VERCEL_SETUP.md) for deployment
3. Deploy backend on Railway
4. Deploy frontend on Vercel

---

**Need help?** Check [QUICK_START.md](./QUICK_START.md) or [SETUP.md](./SETUP.md)
