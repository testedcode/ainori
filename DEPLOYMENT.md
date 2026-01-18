# Deployment Guide for cpool.ai

## Prerequisites

- GitHub account
- Vercel account (for frontend)
- Railway account (for backend)
- PostgreSQL database (Vercel Postgres, Supabase, Neon, or Railway Postgres)

## Frontend Deployment (Vercel)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/testedcode/cpool.ai.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository `testedcode/cpool.ai`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` = Your Railway backend URL (e.g., `https://your-app.railway.app/api`)

6. Click "Deploy"

### Step 3: Update vercel.json

After deployment, update `vercel.json` with your actual Railway backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-railway-backend-url.railway.app/api/:path*"
    }
  ]
}
```

## Backend Deployment (Railway)

### Step 1: Set up Railway Project

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repository `testedcode/cpool.ai`

### Step 2: Add PostgreSQL Database

1. In Railway dashboard, click "New" → "Database" → "Add PostgreSQL"
2. Railway will automatically create a PostgreSQL database
3. Note the connection details (will be in `DATABASE_URL` environment variable)

### Step 3: Configure Backend Service

1. Railway should auto-detect Go
2. Set Root Directory to `backend`
3. Add Environment Variables:
   - `PORT` = `8080` (or leave empty, Railway will set it)
   - `DATABASE_URL` = (automatically set by Railway Postgres)
   - `JWT_SECRET` = (generate a strong random secret)

### Step 4: Deploy

Railway will automatically build and deploy. The build command will be:
```bash
go build -o bin/server main.go
```

And start command:
```bash
./bin/server
```

### Step 5: Run Migrations

After first deployment, run migrations:

**Option 1: SSH into Railway container**
```bash
railway run go run cmd/migrate/main.go
```

**Option 2: Create a migration service**
- Add a new service in Railway
- Use the same codebase
- Set start command: `go run cmd/migrate/main.go`
- Run once, then delete the service

**Option 3: Manual SQL**
- Connect to your PostgreSQL database
- Run the SQL from `backend/internal/db/migrations.go`

### Step 6: Get Backend URL

1. In Railway dashboard, go to your service
2. Click "Settings" → "Generate Domain"
3. Copy the URL (e.g., `https://your-app.railway.app`)
4. Update Vercel environment variable `NEXT_PUBLIC_API_URL` to `https://your-app.railway.app/api`

## Database Setup Options

### Option 1: Railway Postgres (Recommended)
- Free tier available
- Automatically configured
- `DATABASE_URL` is set automatically

### Option 2: Vercel Postgres
- Integrated with Vercel
- Free tier: 256MB storage
- Add as integration in Vercel dashboard

### Option 3: Supabase
- Free tier: 500MB
- Create project at [supabase.com](https://supabase.com)
- Get connection string from Settings → Database
- Add as `DATABASE_URL` in Railway

### Option 4: Neon
- Free tier: 3GB
- Create project at [neon.tech](https://neon.tech)
- Get connection string
- Add as `DATABASE_URL` in Railway

## Environment Variables Summary

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL` = Backend API URL

### Backend (Railway)
- `PORT` = `8080` (optional, Railway sets automatically)
- `DATABASE_URL` = PostgreSQL connection string
- `JWT_SECRET` = Random secret key (use a strong random string)

## Post-Deployment Checklist

- [ ] Backend is running and accessible
- [ ] Database migrations completed
- [ ] Frontend can connect to backend API
- [ ] Admin user can login (`admin@135` / `admin`)
- [ ] Test user registration
- [ ] Test ride creation
- [ ] Test ride requests
- [ ] Verify CORS is working
- [ ] Check logs for errors

## Troubleshooting

### Backend not connecting to database
- Verify `DATABASE_URL` is set correctly
- Check database is accessible from Railway
- Ensure migrations have run

### Frontend can't reach backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Verify backend is deployed and running

### 401 Unauthorized errors
- Check JWT_SECRET is set
- Verify token is being sent in Authorization header
- Check token expiration

### Database errors
- Ensure migrations have run
- Check database connection string format
- Verify database is accessible

## Monitoring

- **Vercel**: Check deployment logs and analytics
- **Railway**: Check service logs and metrics
- **Database**: Monitor connection pool and queries

## Scaling

- Railway: Upgrade plan for more resources
- Vercel: Automatic scaling on Pro plan
- Database: Upgrade PostgreSQL plan as needed

---

For issues, check:
- Railway logs: `railway logs`
- Vercel logs: Dashboard → Project → Deployments → View Logs

