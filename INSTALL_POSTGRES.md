# 🗄️ PostgreSQL Installation Guide

## ✅ Quick Decision Guide

**Choose the easiest option for you:**

1. **Docker** (Recommended - Easiest) ⭐
   - One command setup
   - No complex installation
   - Easy to remove later
   - **Time: 5 minutes**

2. **Direct PostgreSQL Install**
   - Full PostgreSQL installation
   - More permanent
   - **Time: 15 minutes**

3. **Cloud Database** (Free)
   - No local installation needed
   - Works immediately
   - **Time: 5 minutes**

---

## Option 1: Docker (Easiest) ⭐ RECOMMENDED

### Step 1: Install Docker Desktop

1. **Download Docker Desktop:**
   - Go to: https://www.docker.com/products/docker-desktop
   - Click "Download for Windows"
   - Run the installer

2. **Install Docker Desktop:**
   - Follow the installation wizard
   - Restart your computer when prompted
   - Start Docker Desktop from Start menu

3. **Verify Installation:**
   ```powershell
   docker --version
   ```

### Step 2: Run Setup Script

Once Docker is installed, run:
```powershell
.\setup-postgres-docker.ps1
```

**That's it!** The script will:
- ✅ Create PostgreSQL container
- ✅ Set password to `postgres123`
- ✅ Create database `cpool`
- ✅ Update `backend/.env` automatically

### Step 3: Verify

```powershell
docker ps
```

You should see `cpool-db` running!

---

## Option 2: Install PostgreSQL Directly

### Step 1: Download PostgreSQL

1. Go to: https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Download **PostgreSQL 14** or **15**

### Step 2: Install PostgreSQL

1. **Run the installer**
2. **Choose components:** Keep defaults (all checked)
3. **Data directory:** Keep default (`C:\Program Files\PostgreSQL\14\data`)
4. **Password:** Set a password for `postgres` user
   - **Remember this password!** You'll need it!
   - Example: `postgres123`
5. **Port:** Keep default `5432`
6. **Locale:** Keep default
7. **Complete installation**

### Step 3: Add to PATH

1. Find PostgreSQL bin folder:
   - Usually: `C:\Program Files\PostgreSQL\14\bin`
   - Or: `C:\Program Files\PostgreSQL\15\bin`

2. Add to System PATH:
   - Press `Win + X` → System
   - Advanced System Settings
   - Environment Variables
   - Under "System variables", find "Path" → Edit
   - New → Paste PostgreSQL bin path
   - OK → OK → OK

3. **Restart PowerShell**

### Step 4: Verify Installation

```powershell
psql --version
```

### Step 5: Create Database

```powershell
# Set your PostgreSQL password
$env:PGPASSWORD="postgres123"

# Create database
psql -U postgres -c "CREATE DATABASE cpool;"

# Verify
psql -U postgres -l | Select-String "cpool"
```

### Step 6: Update backend/.env

Edit `backend/.env`:
```env
DATABASE_URL=postgres://postgres:postgres123@localhost:5432/cpool?sslmode=disable
```

Replace `postgres123` with your actual password!

---

## Option 3: Cloud Database (Free - No Installation)

### Option A: Supabase (Recommended)

1. **Sign up:** https://supabase.com
2. **Create project:**
   - Click "New Project"
   - Name: `cpool`
   - Database Password: (set a strong password)
   - Region: Choose closest
   - Click "Create new project"

3. **Get connection string:**
   - Go to Settings → Database
   - Find "Connection string" section
   - Copy the "URI" format
   - Example: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

4. **Update backend/.env:**
   ```env
   DATABASE_URL=your_supabase_connection_string_here
   ```

### Option B: Neon

1. **Sign up:** https://neon.tech
2. **Create project:**
   - Click "Create Project"
   - Name: `cpool`
   - Click "Create"

3. **Get connection string:**
   - Copy the connection string shown
   - Format: `postgresql://user:password@host/database`

4. **Update backend/.env:**
   ```env
   DATABASE_URL=your_neon_connection_string_here
   ```

### Option C: Railway

1. **Sign up:** https://railway.app
2. **New Project** → **Database** → **Add PostgreSQL**
3. **Copy connection string** from Variables tab
4. **Update backend/.env**

---

## 🎯 Recommended: Docker Setup

**Why Docker?**
- ✅ Fastest setup (5 minutes)
- ✅ No system changes
- ✅ Easy to remove
- ✅ Works on any Windows version
- ✅ Isolated from your system

**Quick Start:**
1. Install Docker Desktop: https://www.docker.com/products/docker-desktop
2. Run: `.\setup-postgres-docker.ps1`
3. Done! ✅

---

## 🔍 Verify Your Setup

After any option, test the connection:

```powershell
# For Docker:
docker exec -it cpool-db psql -U postgres -d cpool -c "SELECT version();"

# For Local PostgreSQL:
psql -U postgres -d cpool -c "SELECT version();"
```

You should see PostgreSQL version info!

---

## 🆘 Troubleshooting

### Docker Issues

**Docker not starting?**
- Make sure virtualization is enabled in BIOS
- Check Windows features: WSL2, Hyper-V, or Virtual Machine Platform

**Port 5432 already in use?**
- Change port in docker command: `-p 5433:5432`
- Update `backend/.env` accordingly

### PostgreSQL Installation Issues

**psql command not found?**
- Add PostgreSQL to PATH (see Step 3 above)
- Restart PowerShell

**Can't connect?**
- Check PostgreSQL service is running:
  ```powershell
  Get-Service postgresql*
  ```
- Start service if stopped:
  ```powershell
  Start-Service postgresql-x64-14
  ```

### Cloud Database Issues

**Connection timeout?**
- Check firewall settings
- Verify connection string is correct
- Check if database is paused (some free tiers pause after inactivity)

---

## 📝 Next Steps After Setup

1. ✅ Database is ready
2. ✅ Run migrations:
   ```powershell
   cd backend
   go run cmd/migrate/main.go
   ```
3. ✅ Start backend:
   ```powershell
   cd backend
   go run main.go
   ```
4. ✅ Start frontend:
   ```powershell
   cd frontend
   npm run dev
   ```

---

**Choose Docker for the easiest setup! 🐳**
