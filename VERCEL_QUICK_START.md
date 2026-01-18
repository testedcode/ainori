# 🚀 Quick Vercel Deployment Guide

## ✅ Frontend is Ready!

Build successful! Frontend is ready to deploy.

---

## Step 1: Push to GitHub

```powershell
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Add remote (if not added)
git remote add origin https://github.com/testedcode/cpool.ai.git

# Push
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy on Vercel

### Quick Method (Dashboard)

1. **Go to Vercel**
   - https://vercel.com
   - Sign up/Login (use GitHub)

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - **Import Git Repository**
   - Select: `testedcode/cpool.ai`
   - Click **"Import"**

3. **Configure**
   - **Root Directory:** `frontend` ⚠️ **IMPORTANT!**
   - **Framework:** Next.js (auto-detected)
   - **Build Command:** `npm run build` (auto)
   - **Output Directory:** `.next` (auto)

4. **Environment Variables**
   - Click **"Environment Variables"**
   - Add:
     ```
     Name: NEXT_PUBLIC_API_URL
     Value: http://localhost:8080/api
     ```
   - ⚠️ Update this later when backend is deployed!

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes

---

## Step 3: After Deployment

Your site will be live at: `https://your-project.vercel.app`

**Note:** Backend features won't work until backend is deployed.

---

## Step 4: Update After Backend Deployment

Once backend is on Railway:

1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. **Edit `NEXT_PUBLIC_API_URL`**
3. **Change to:** `https://your-railway-backend.railway.app/api`
4. **Redeploy**

---

## Current Status

✅ Frontend builds successfully
✅ Ready for Vercel
⚠️ Backend pending (after Go installation)

---

**Ready? Push to GitHub and deploy!** 🚀
