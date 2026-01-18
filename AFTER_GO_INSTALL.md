# ✅ After Installing Go - Next Steps

## Current Status

✅ **Completed:**
- Node.js installed
- Frontend dependencies installed  
- Supabase connection configured
- Password: `Cpool2024!Secure`

⚠️ **Waiting:**
- Go installation

---

## Once Go is Installed

### Step 1: Verify Go Installation

Open PowerShell and run:
```powershell
go version
```

Should show: `go version go1.21.x windows/amd64` (or similar)

### Step 2: Install Backend Dependencies

```powershell
cd backend
go mod download
```

### Step 3: Run Database Migrations

```powershell
cd backend
go run cmd/migrate/main.go
```

**Expected output:**
```
Database connection established
Database migrations completed
```

### Step 4: Start Backend Server

**Terminal 1:**
```powershell
cd backend
go run main.go
```

**Expected output:**
```
Database connection established
Database migrations completed
Server starting on port 8080
```

### Step 5: Start Frontend Server

**Terminal 2 (new PowerShell window):**
```powershell
cd frontend
npm run dev
```

**Expected output:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

### Step 6: Open Browser

👉 **http://localhost:3000**

**Login:**
- Email: `admin@135`
- Password: `admin`

---

## Quick Commands Summary

```powershell
# Install backend dependencies
cd backend
go mod download

# Run migrations
go run cmd/migrate/main.go

# Start backend (Terminal 1)
go run main.go

# Start frontend (Terminal 2)
cd ../frontend
npm run dev
```

---

## Troubleshooting

### Go Still Not Found After Installation?

1. **Restart PowerShell** (important!)
2. Check PATH: `$env:PATH -split ';' | Select-String "go"`
3. Go should be in: `C:\Program Files\Go\bin`

### Database Connection Fails?

- Check password is correct: `Cpool2024!Secure`
- Verify project is active in Supabase dashboard
- Check internet connection

### Port Already in Use?

- Backend: Change `PORT` in `backend/.env` to `8081`
- Update `frontend/.env.local` to `http://localhost:8081/api`

---

**Ready? Install Go and let's continue! 🚀**
