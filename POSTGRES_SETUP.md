# 🗄️ PostgreSQL Setup Guide

## Option 1: Docker (Easiest - Recommended)

If you have Docker installed, this is the easiest way!

### Step 1: Check Docker
```powershell
docker --version
```

### Step 2: Run PostgreSQL Container
```powershell
docker run --name cpool-db `
  -e POSTGRES_PASSWORD=postgres123 `
  -e POSTGRES_DB=cpool `
  -p 5432:5432 `
  -d postgres:14
```

**Password:** `postgres123` (you can change this)

### Step 3: Verify It's Running
```powershell
docker ps | Select-String "cpool-db"
```

### Step 4: Update backend/.env
```env
DATABASE_URL=postgres://postgres:postgres123@localhost:5432/cpool?sslmode=disable
```

### Step 5: Test Connection
```powershell
docker exec -it cpool-db psql -U postgres -d cpool -c "SELECT version();"
```

### To Stop Database
```powershell
docker stop cpool-db
```

### To Start Database Again
```powershell
docker start cpool-db
```

---

## Option 2: Install PostgreSQL (Full Installation)

### Step 1: Download PostgreSQL
1. Go to: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Download PostgreSQL 14 or 15

### Step 2: Install PostgreSQL
1. Run the installer
2. **Important:** Remember the password you set for `postgres` user!
3. Use default port: `5432`
4. Complete installation

### Step 3: Add to PATH (if needed)
1. Find PostgreSQL bin folder (usually `C:\Program Files\PostgreSQL\14\bin`)
2. Add to System PATH:
   - Right-click "This PC" → Properties
   - Advanced System Settings → Environment Variables
   - System Variables → Path → Edit
   - Add PostgreSQL bin folder
   - OK → OK → OK
3. Restart PowerShell

### Step 4: Verify Installation
```powershell
psql --version
```

### Step 5: Create Database
```powershell
# Set password (replace with your PostgreSQL password)
$env:PGPASSWORD="your_postgres_password"

# Create database
psql -U postgres -c "CREATE DATABASE cpool;"

# Verify
psql -U postgres -l | Select-String "cpool"
```

### Step 6: Update backend/.env
```env
DATABASE_URL=postgres://postgres:your_postgres_password@localhost:5432/cpool?sslmode=disable
```

---

## Option 3: Use Cloud Database (Free Tier)

### Option A: Supabase (Recommended)
1. Go to: https://supabase.com
2. Sign up (free)
3. Create new project
4. Go to Settings → Database
5. Copy "Connection string" (URI format)
6. Update `backend/.env`:
   ```env
   DATABASE_URL=your_supabase_connection_string
   ```

### Option B: Neon
1. Go to: https://neon.tech
2. Sign up (free)
3. Create new project
4. Copy connection string
5. Update `backend/.env`

### Option C: Railway Postgres
1. Go to: https://railway.app
2. Sign up
3. New Project → Database → PostgreSQL
4. Copy connection string
5. Update `backend/.env`

---

## Quick Setup Script (Docker)

I'll create a script to set up PostgreSQL with Docker automatically!
