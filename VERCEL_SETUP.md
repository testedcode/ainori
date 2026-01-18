# 🚀 Vercel Deployment Guide

## Prerequisites

1. ✅ GitHub account
2. ✅ Vercel account ([Sign up](https://vercel.com))
3. ✅ Backend deployed on Railway (see [DEPLOYMENT.md](./DEPLOYMENT.md))

## Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - cpool.ai"

# Add remote (replace with your GitHub username)
git remote add origin https://github.com/testedcode/cpool.ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend on Railway First

**Important**: Deploy backend first to get the API URL!

1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your repository
5. Add PostgreSQL database
6. Set environment variables:
   - `DATABASE_URL` (auto-set by Railway Postgres)
   - `JWT_SECRET` (generate a strong random string)
   - `PORT` (optional, Railway sets automatically)
7. Deploy and note the URL (e.g., `https://your-app.railway.app`)

## Step 3: Deploy Frontend on Vercel

### Option A: Using Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"

2. **Import Repository**
   - Click "Import Git Repository"
   - Select `testedcode/cpool.ai`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT!**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Environment Variables**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_API_URL = https://your-railway-backend-url.railway.app/api
   ```
   Replace `your-railway-backend-url` with your actual Railway URL!

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? cpool-ai (or your choice)
# - Directory? ./
# - Override settings? No

# Add environment variable
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://your-railway-backend-url.railway.app/api
# Select: Production, Preview, Development

# Redeploy with env var
vercel --prod
```

## Step 4: Update vercel.json (Optional)

After deployment, update `vercel.json` with your Railway backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-actual-railway-url.railway.app/api/:path*"
    }
  ]
}
```

Then redeploy:
```bash
git add vercel.json
git commit -m "Update vercel.json with Railway URL"
git push
```

Vercel will auto-deploy on push.

## Step 5: Verify Deployment

1. **Check Frontend**: Visit your Vercel URL (e.g., `https://cpool-ai.vercel.app`)
2. **Test Login**: Use admin credentials (`admin@135` / `admin`)
3. **Check Backend Connection**: Open browser console, check for API calls
4. **Test Features**: Register user, create ride, etc.

## Step 6: Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `cpool.ai`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (~5-30 minutes)

## 🔧 Troubleshooting

### Build Fails on Vercel

**Error**: `Module not found` or `Cannot find module`
**Solution**: 
- Ensure `Root Directory` is set to `frontend`
- Check `package.json` has all dependencies
- Review build logs in Vercel dashboard

### Frontend Can't Connect to Backend

**Error**: `Network Error` or `CORS Error`
**Solution**:
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check Railway backend is running
- Verify backend URL doesn't have trailing slash
- Check backend CORS settings

### Environment Variables Not Working

**Error**: `NEXT_PUBLIC_API_URL` is undefined
**Solution**:
- Ensure variable name starts with `NEXT_PUBLIC_`
- Redeploy after adding environment variables
- Check variable is set for correct environment (Production/Preview)

### 404 Errors on Routes

**Error**: Page not found
**Solution**:
- Ensure using Next.js App Router (not Pages Router)
- Check file structure matches route structure
- Verify `next.config.js` is correct

## 📊 Monitoring

- **Vercel Dashboard**: View deployments, logs, analytics
- **Railway Dashboard**: View backend logs, metrics
- **Browser Console**: Check for frontend errors
- **Network Tab**: Monitor API calls

## 🔄 Continuous Deployment

Vercel automatically deploys on every push to `main` branch.

To deploy manually:
```bash
vercel --prod
```

## 🎯 Production Checklist

- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Admin password changed
- [ ] JWT_SECRET changed
- [ ] CORS configured correctly
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active (automatic)
- [ ] Monitoring set up

## 📝 Environment Variables Reference

### Vercel (Frontend)
- `NEXT_PUBLIC_API_URL` - Backend API URL

### Railway (Backend)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (optional)

## 🆘 Support

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Project Issues**: Check GitHub issues

---

**Your app is now live! 🎉**

Visit your Vercel URL to see it in action.
