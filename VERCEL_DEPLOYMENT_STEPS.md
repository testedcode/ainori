# 🚀 Complete Vercel Deployment Guide

## Your Repository
**GitHub:** https://github.com/testedcode/ainori

---

## Step 1: Push Code to GitHub

Run these commands in PowerShell:

```powershell
# Add all files
git add .

# Commit
git commit -m "Initial commit - cpool.ai ready for Vercel"

# Set main branch
git branch -M main

# Add remote (if not already added)
git remote add origin https://github.com/testedcode/ainori.git

# Push to GitHub
git push -u origin main
```

**Note:** If remote already exists, use:
```powershell
git remote set-url origin https://github.com/testedcode/ainori.git
git push -u origin main
```

---

## Step 2: Deploy on Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit: https://vercel.com
   - **Sign up** or **Login**
   - **Use GitHub** to sign in (easiest!)

2. **Import Project**
   - Click **"Add New..."** button (top right)
   - Select **"Project"**
   - Click **"Import Git Repository"**
   - Find and select: **`testedcode/ainori`**
   - Click **"Import"**

3. **Configure Project** ⚠️ **IMPORTANT SETTINGS!**

   **Framework Preset:**
   - Should auto-detect: **Next.js**
   - If not, select **Next.js**

   **Root Directory:**
   - ⚠️ **Change to:** `frontend`
   - Click **"Edit"** next to Root Directory
   - Enter: `frontend`
   - This tells Vercel where your Next.js app is!

   **Build Settings:**
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Environment Variables**
   - Click **"Environment Variables"** section
   - Click **"Add"**
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `http://localhost:8080/api`
   - **Environments:** Select all (Production, Preview, Development)
   - Click **"Save"**
   
   ⚠️ **Note:** This is temporary. Update it later when backend is deployed on Railway.

5. **Deploy**
   - Click **"Deploy"** button
   - Wait 2-3 minutes for build
   - Watch the build logs

6. **Success!**
   - You'll see: **"Congratulations! Your project has been deployed"**
   - Your site URL: `https://ainori.vercel.app` (or similar)

---

### Option B: Using Vercel CLI

```powershell
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? ainori (or your choice)
# - Directory? frontend
# - Override settings? No

# Add environment variable
vercel env add NEXT_PUBLIC_API_URL
# Enter: http://localhost:8080/api
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

---

## Step 3: Verify Deployment

1. **Visit your Vercel URL**
   - Example: `https://ainori.vercel.app`
   - Or check Vercel dashboard for your URL

2. **Test the site**
   - Homepage should load ✅
   - Navigation should work ✅
   - Pages should load ✅
   - ⚠️ Backend features won't work yet (backend not deployed)

---

## Step 4: Update After Backend Deployment

Once you deploy backend on Railway (after Go installation):

1. **Get Railway Backend URL**
   - Example: `https://your-app.railway.app`

2. **Update Vercel Environment Variable**
   - Go to Vercel Dashboard
   - Your Project → **Settings** → **Environment Variables**
   - Edit `NEXT_PUBLIC_API_URL`
   - Change to: `https://your-app.railway.app/api`
   - Save

3. **Redeploy**
   - Go to **Deployments** tab
   - Click **"Redeploy"** on latest deployment
   - Or push a new commit (auto-deploys)

---

## ⚠️ Important Configuration

### Root Directory: `frontend`
**This is critical!** Vercel needs to know your Next.js app is in the `frontend` folder.

### Environment Variable
- **Name:** `NEXT_PUBLIC_API_URL`
- **Value:** `http://localhost:8080/api` (temporary)
- Update to Railway URL after backend deployment

---

## Current Status

✅ Frontend builds successfully
✅ Code ready to push
✅ Repository created: https://github.com/testedcode/ainori
⏳ Waiting for: Push to GitHub → Deploy on Vercel

---

## Troubleshooting

### Build Fails on Vercel?

**Error:** "Cannot find module" or "Build failed"
- **Check:** Root Directory is set to `frontend`
- **Check:** Build logs in Vercel dashboard
- **Check:** All dependencies in `frontend/package.json`

### Environment Variable Not Working?

- Make sure variable name starts with `NEXT_PUBLIC_`
- Redeploy after adding environment variables
- Check variable is set for correct environment (Production)

### Site Loads But API Calls Fail?

- This is normal! Backend isn't deployed yet
- Deploy backend on Railway first
- Then update `NEXT_PUBLIC_API_URL` environment variable

---

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Root Directory set to `frontend`
- [ ] Environment variable added
- [ ] Deployed successfully
- [ ] Site is accessible

---

**Ready? Push to GitHub and deploy on Vercel!** 🚀

Your site will be live at: `https://ainori.vercel.app` (or your custom domain)
