# 🚀 Complete Installation Guide

## Quick Links - Download Everything

### Essential Software

| Software | Download Link | Version Needed |
|----------|--------------|----------------|
| **Node.js** | https://nodejs.org | 18+ (LTS) |
| **Go** | https://golang.org/dl/ | 1.21+ |
| **Git** (optional) | https://git-scm.com/download/win | Latest |

### Database (Choose ONE)

| Option | Link | Status |
|--------|------|--------|
| **Supabase** (Cloud) | https://supabase.com | ✅ You have it! |
| **Docker** (Local) | https://www.docker.com/products/docker-desktop | Optional |
| **PostgreSQL** (Local) | https://www.postgresql.org/download/windows/ | Optional |

---

## 📥 Step-by-Step Installation

### 1. Install Node.js (5 minutes)

**Download:**
- Go to: https://nodejs.org
- Click big green "Download Node.js (LTS)" button
- File: `node-v20.x.x-x64.msi` (or similar)

**Install:**
1. Run the downloaded `.msi` file
2. Click "Next" through all steps
3. Keep default options
4. Click "Install"
5. Restart PowerShell after installation

**Verify:**
```powershell
node --version
# Should show: v20.x.x or v18.x.x
```

---

### 2. Install Go (5 minutes)

**Download:**
- Go to: https://golang.org/dl/
- Find "Microsoft Windows" section
- Download: `go1.21.x.windows-amd64.msi` (or latest)

**Install:**
1. Run the downloaded `.msi` file
2. Click "Next" through all steps
3. Keep default installation path: `C:\Program Files\Go`
4. Click "Install"
5. Restart PowerShell after installation

**Verify:**
```powershell
go version
# Should show: go version go1.21.x windows/amd64
```

---

### 3. Setup Supabase (Already Done!)

**You Already Have:**
- ✅ Supabase account
- ✅ Project: `xmsfwmuqgzigkisjzhaw.supabase.co`

**What You Need:**
1. **Database Password**
   - The password you set when creating the project
   - If forgotten: Settings → Database → Reset password

2. **Connection String**
   - Go to: https://app.supabase.com
   - Select your project
   - Settings → Database
   - Scroll to "Connection string"
   - Click "URI" tab
   - Copy the connection string

**Format:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.xmsfwmuqgzigkisjzhaw.supabase.co:5432/postgres
```

---

## ✅ After Installation Checklist

Run this to check everything:

```powershell
# Check Node.js
node --version
# ✅ Should show version

# Check npm (comes with Node.js)
npm --version
# ✅ Should show version

# Check Go
go version
# ✅ Should show version

# Check Git (optional)
git --version
# ✅ Should show version (or "not found" is OK)
```

---

## 🎯 Quick Setup Script

After installing Node.js and Go, run:

```powershell
# 1. Setup Supabase connection
.\update-supabase-env.ps1

# 2. Install dependencies
cd frontend
npm install
cd ../backend
go mod download
cd ..

# 3. Run migrations
cd backend
go run cmd/migrate/main.go

# 4. Start backend (Terminal 1)
go run main.go

# 5. Start frontend (Terminal 2)
cd ../frontend
npm run dev
```

---

## 🆘 Troubleshooting

### Node.js Issues

**"node is not recognized"**
- Restart PowerShell/Command Prompt
- Check if Node.js is in PATH
- Reinstall Node.js

**Version too old**
- Download latest LTS from nodejs.org
- Uninstall old version first

### Go Issues

**"go is not recognized"**
- Restart PowerShell
- Check installation path: `C:\Program Files\Go\bin`
- Add to PATH if needed

**Version too old**
- Download latest from golang.org/dl/
- Uninstall old version first

### Supabase Issues

**Can't find connection string**
- Make sure you're in the correct project
- Check Settings → Database (not API settings)
- Look for "Connection string" section (scroll down)

**Connection fails**
- Verify password is correct
- Check if project is paused (free tier pauses after inactivity)
- Try resetting database password

---

## 📚 Additional Resources

- **Node.js Docs:** https://nodejs.org/docs
- **Go Docs:** https://go.dev/doc
- **Supabase Docs:** https://supabase.com/docs
- **Project Setup:** See `START_HERE.md`

---

## 🎉 You're Ready!

Once you have:
- ✅ Node.js installed
- ✅ Go installed  
- ✅ Supabase connection string

Run: `.\update-supabase-env.ps1` to complete setup!
