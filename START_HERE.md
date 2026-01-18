# 🚀 START HERE - cpool.ai Setup Guide

## Quick Navigation

- **New to the project?** → Read [QUICK_START.md](./QUICK_START.md)
- **Windows user?** → Read [LOCAL_SETUP_WINDOWS.md](./LOCAL_SETUP_WINDOWS.md)
- **Ready to deploy?** → Read [VERCEL_SETUP.md](./VERCEL_SETUP.md)
- **Need detailed setup?** → Read [SETUP.md](./SETUP.md)

## 🎯 What You Need

1. ✅ **Node.js** 18+ - [Download](https://nodejs.org)
2. ✅ **Go** 1.21+ - [Download](https://golang.org)
3. ✅ **PostgreSQL** 14+ - [Download](https://www.postgresql.org/download/)

## ⚡ Quick Start (5 Minutes)

### 1. Install Dependencies
```powershell
# Windows PowerShell
.\setup-local.ps1

# OR manually:
cd frontend && npm install
cd ../backend && go mod download
```

### 2. Setup Database
```powershell
# Create database
psql -U postgres -c "CREATE DATABASE cpool;"
```

### 3. Configure Environment

**Create `backend/.env`:**
```env
PORT=8080
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/cpool?sslmode=disable
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

**Create `frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 4. Run Migrations
```powershell
cd backend
go run cmd/migrate/main.go
```

### 5. Start Servers

**Terminal 1:**
```powershell
cd backend
go run main.go
```

**Terminal 2:**
```powershell
cd frontend
npm run dev
```

### 6. Open Browser
👉 **http://localhost:3000**

**Login:**
- Email: `admin@135`
- Password: `admin`

## 📚 Documentation

| File | Purpose |
|------|---------|
| [QUICK_START.md](./QUICK_START.md) | Quick setup guide |
| [LOCAL_SETUP_WINDOWS.md](./LOCAL_SETUP_WINDOWS.md) | Detailed Windows setup |
| [SETUP.md](./SETUP.md) | General setup guide |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment |
| [VERCEL_SETUP.md](./VERCEL_SETUP.md) | Vercel deployment guide |
| [README.md](./README.md) | Project overview |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Feature list |

## 🆘 Troubleshooting

**Can't connect to database?**
- Check PostgreSQL is running
- Verify password in `backend/.env`
- Ensure database `cpool` exists

**Port already in use?**
- Change `PORT` in `backend/.env`
- Update `NEXT_PUBLIC_API_URL` accordingly

**Module not found?**
- Run `npm install` in `frontend/`
- Run `go mod download` in `backend/`

**Need more help?**
- Check [SETUP.md](./SETUP.md) for detailed troubleshooting
- Review error messages in terminal
- Check browser console for frontend errors

## 🎉 Next Steps

1. ✅ Complete local setup
2. ✅ Test all features
3. ✅ Deploy backend on Railway
4. ✅ Deploy frontend on Vercel
5. ✅ Share your app!

---

**Ready? Let's go! 🚗**
