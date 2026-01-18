# 🚀 Deploy to Vercel - Step by Step

## Current Status

✅ Frontend is ready for deployment
⚠️ Backend will be deployed separately (after Go installation)

---

## Step 1: Push Code to GitHub

### If you haven't initialized Git:

```powershell
# Initialize git
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

### If Git is already initialized:

```powershell
git add .
git commit -m "Ready for Vercel deployment"
git push
```

---

## Step 2: Deploy on Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign up/Login (use GitHub if possible)

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - Click **"Import Git Repository"**
   - Select `testedcode/cpool.ai`
   - Click **"Import"**

3. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `frontend` ⚠️ **IMPORTANT!**
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Environment Variables**
   - Click **"Environment Variables"**
   - Add:
     ```
     Name: NEXT_PUBLIC_API_URL
     Value: http://localhost:8080/api
     ```
   - ⚠️ **Note:** This is temporary. Update it later when backend is deployed.

5. **Deploy**
   - Click **"Deploy"**
   - Wait 2-3 minutes for build

### Option B: Using Vercel CLI

```powershell
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
# - Project name? cpool-ai
# - Directory? ./
# - Override settings? No

# Add environment variable
vercel env add NEXT_PUBLIC_API_URL
# Enter: http://localhost:8080/api
# Select: Production, Preview, Development

# Redeploy
vercel --prod
```

---

## Step 3: Update Configuration After Backend is Deployed

Once your backend is deployed (on Railway), update the environment variable:

1. **Go to Vercel Dashboard**
2. **Your Project** → **Settings** → **Environment Variables**
3. **Edit `NEXT_PUBLIC_API_URL`**
4. **Change to:** `https://your-railway-backend-url.railway.app/api`
5. **Redeploy**

---

## Step 4: Verify Deployment

1. **Visit your Vercel URL**
   - Example: `https://cpool-ai.vercel.app`
   - Or check Vercel dashboard for your URL

2. **Test the site**
   - Homepage should load
   - Login page should work
   - ⚠️ Backend features won't work until backend is deployed

---

## Current Limitations

Since backend isn't deployed yet:
- ❌ Login won't work (needs backend)
- ❌ API calls will fail
- ✅ Frontend UI will work
- ✅ Pages will load

**This is normal!** Once backend is deployed, everything will work.

---

## Next Steps After Backend Deployment

1. **Deploy backend on Railway** (after Go installation)
2. **Get Railway backend URL**
3. **Update Vercel environment variable**
4. **Redeploy frontend**

---

## Quick Commands Summary

```powershell
# Push to GitHub
git add .
git commit -m "Ready for Vercel"
git push

# Deploy with Vercel CLI (optional)
cd frontend
vercel --prod
```

---

**Ready? Push to GitHub and deploy on Vercel!** 🚀
