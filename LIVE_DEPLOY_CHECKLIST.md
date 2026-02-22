# Live deploy checklist – get cpool.ai working end-to-end

Do these steps **in order**. Everything is prepared in the repo; you only need to run SQL once, create one backend service, and set two env vars.

**I cannot log into Render, Vercel, or Supabase for you** – you must run the steps below. If your repo is not yet pushed to GitHub, push it so Render can deploy from it.

---

## What you need handy

- **Supabase:** Project URL or project ref (e.g. `xmsfwmuqgzigkisjzhaw`) and the **database password** (Supabase → Settings → Database).
- **GitHub:** Repo connected to Vercel (and you’ll connect the same repo to Render).

---

## Step 1: Supabase – create tables and admin user

1. Open [Supabase](https://app.supabase.com) → your project.
2. Go to **SQL Editor** → **New query**.
3. Open the file **`supabase_schema.sql`** from this repo (root folder).
4. Copy its **entire** contents and paste into the Supabase SQL Editor.
5. Click **Run**.
6. You should see “Success. No rows returned” (or similar). Tables and seed data (cities, admin user, corridors, feature flags) are now in place.

**Admin login (after backend is live):** Email `admin@135` / Password `password`.

---

## Step 2: Render – deploy the Go backend

1. Go to [Render](https://render.com) and sign in (e.g. with GitHub).
2. **New** → **Web Service**.
3. Connect **GitHub** and select the repo **`testedcode/ainori`** (or your fork).
4. Configure:
   - **Name:** `cpool-backend` (or any name).
   - **Region:** any (e.g. Oregon).
   - **Root Directory:** `backend`
   - **Runtime:** **Go**
   - **Build Command:** `go build -o server .`
   - **Start Command:** `./server`
   - **Instance Type:** **Free**
5. **Environment variables** (Add):
   - **Key:** `DATABASE_URL`  
     **Value:**  
     `postgresql://postgres:YOUR_SUPABASE_DB_PASSWORD@db.xmsfwmuqgzigkisjzhaw.supabase.co:5432/postgres`  
     (Replace `YOUR_SUPABASE_DB_PASSWORD` with the real DB password from Supabase → Settings → Database.)
   - **Key:** `JWT_SECRET`  
     **Value:** Any long random string (e.g. 32+ characters from [randomkeygen.com](https://randomkeygen.com)).
6. Click **Create Web Service** and wait for the first deploy to finish.
7. Copy the service URL (e.g. `https://cpool-backend-xxxx.onrender.com`). No trailing slash.

**Check:** Open `https://YOUR-RENDER-URL.onrender.com/api/health` in the browser. You should see a JSON response (e.g. `{"status":"ok"}`). If the service was sleeping, the first load may take 30–60 seconds.

---

## Step 3: Vercel – point frontend to your backend

1. Go to [Vercel](https://vercel.com) → your **cpool.ai** project (the one that serves e.g. cpoolai.vercel.app).
2. **Settings** → **Environment Variables**.
3. Add or edit:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://YOUR-RENDER-URL.onrender.com/api`  
     (Same URL from Step 2, with `/api` at the end. Example: `https://cpool-backend-xxxx.onrender.com/api`.)
   - Apply to **Production** (and Preview if you want).
4. **Redeploy:** Deployments → … on latest → **Redeploy** (so the new env var is used).

---

## Step 4: Test login on the live site

1. Open your live frontend (e.g. `https://cpoolai.vercel.app/login`).
2. Log in with:
   - **Email:** `admin@135`
   - **Password:** `password`
3. You should be taken to the dashboard. If you see an admin area in the app, open it and confirm it loads.

---

## If something fails

| Issue | What to do |
|-------|------------|
| **Supabase SQL error** | Make sure you ran the **entire** `supabase_schema.sql`. If tables already exist, running it again is safe (uses `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`). |
| **Render build fails** | Check that **Root Directory** is exactly `backend` and Build Command is `go build -o server .` |
| **Render “Application failed to respond”** | Wait 1–2 minutes (free tier cold start). Check **Logs** in Render for errors. Ensure `DATABASE_URL` is correct (same as Supabase connection string). |
| **Login says “Invalid credentials”** | In Supabase **SQL Editor**, run:  
  `INSERT INTO users (email, password_hash, name, role, city) VALUES ('admin@135', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin User', 'admin', 'Mumbai') ON CONFLICT (email) DO NOTHING;`  
  Then try again with `admin@135` / `password`. |
| **Frontend can’t reach backend** | Confirm `NEXT_PUBLIC_API_URL` in Vercel is exactly `https://YOUR-RENDER-URL/api` (with `/api`). Redeploy after changing. In browser DevTools → Network, check the login request URL. |

---

## Summary

| Step | Where | What you do |
|------|--------|-------------|
| 1 | Supabase | Run `supabase_schema.sql` once in SQL Editor. |
| 2 | Render | New Web Service from repo, root `backend`, set `DATABASE_URL` and `JWT_SECRET`, deploy. |
| 3 | Vercel | Set `NEXT_PUBLIC_API_URL` to `https://<your-render-url>/api`, redeploy. |
| 4 | Browser | Log in at your Vercel URL with `admin@135` / `password`. |

After this, the app runs live: **Vercel (frontend) + Render (backend) + Supabase (DB)**, and login works.
