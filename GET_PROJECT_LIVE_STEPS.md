# Get cpool.ai live – step-by-step (your Supabase project)

Your Supabase project: **xmsfwmuqgzigkisjzhaw**  
Do these steps in order. Total time: about 15 minutes.

---

## Step 1: Supabase – run the database script

1. Open your project:  
   **https://supabase.com/dashboard/project/xmsfwmuqgzigkisjzhaw**

2. In the left sidebar, click **SQL Editor**.

3. Click **New query**.

4. In this repo, open the file **`supabase_schema.sql`** (in the root folder of the project). Select all (Ctrl+A), copy.

5. Paste into the Supabase SQL Editor box.

6. Click **Run** (or press Ctrl+Enter).

7. You should see a success message (e.g. “Success. No rows returned”).  
   Your database now has all tables and the admin user.

**Admin login (use after Step 4):** Email **admin@135** | Password **password**

---

## Step 2: Get your Supabase database password

1. In the same Supabase project, go to **Settings** (gear icon in the left sidebar).

2. Click **Database**.

3. Find **Database password**.  
   - If you don’t remember it: use **Reset database password**, set a new one, and save it somewhere safe.

4. Your connection string will look like this (replace `YOUR_PASSWORD` with the real password):
   ```text
   postgresql://postgres:YOUR_PASSWORD@db.xmsfwmuqgzigkisjzhaw.supabase.co:5432/postgres
   ```
   You’ll paste this into Render in Step 3.

---

## Step 3: Render – deploy the backend

1. Go to **https://render.com** and sign in (e.g. with GitHub).

2. Click **New +** → **Web Service**.

3. Connect **GitHub** if needed, then select the repo **`ainori`** (or `testedcode/ainori`).

4. Fill in:

   | Field | Value |
   |-------|--------|
   | **Name** | `cpool-backend` |
   | **Region** | e.g. Oregon (any is fine) |
   | **Root Directory** | `backend` |
   | **Runtime** | **Go** |
   | **Build Command** | `go build -o server .` |
   | **Start Command** | `./server` |
   | **Instance Type** | **Free** |

5. Scroll to **Environment Variables** → **Add Environment Variable**.

   - **Key:** `DATABASE_URL`  
     **Value:**  
     `postgresql://postgres:YOUR_PASSWORD@db.xmsfwmuqgzigkisjzhaw.supabase.co:5432/postgres`  
     (Use the same password from Step 2; no spaces.)

   - **Key:** `JWT_SECRET`  
     **Value:** any long random string, e.g.  
     `cpool-jwt-secret-change-this-in-production-32chars`  
     (Or generate one at https://randomkeygen.com and use a 256-bit key.)

6. Click **Create Web Service**.

7. Wait for the deploy to finish (a few minutes). When it’s green/done:

8. At the top you’ll see your service URL, e.g.  
   `https://cpool-backend-xxxx.onrender.com`  
   **Copy this URL** (no slash at the end). You need it for Step 4.

**Quick check:** Open in the browser:  
`https://YOUR-RENDER-URL.onrender.com/api/health`  
You should see something like: `{"status":"ok","message":"cpool.ai API is running"}`.  
(If the service was sleeping, the first load can take 30–60 seconds.)

---

## Step 4: Vercel – connect frontend to your backend

1. Go to **https://vercel.com** and open the project that serves **cpoolai.vercel.app** (or your frontend URL).

2. Click **Settings** → **Environment Variables**.

3. Add or edit one variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://YOUR-RENDER-URL.onrender.com/api`  
     (Use the exact URL from Step 3, with `/api` at the end. Example: `https://cpool-backend-xxxx.onrender.com/api`.)
   - **Environment:** check **Production** (and **Preview** if you want).

4. Click **Save**.

5. Go to **Deployments**, open the **⋯** menu on the latest deployment, and click **Redeploy**.  
   This makes the frontend use the new API URL.

---

## Step 5: Test the site and login

1. Open your live site, e.g. **https://cpoolai.vercel.app/login**.

2. Log in with:
   - **Email:** `admin@135`
   - **Password:** `password`

3. You should land on the dashboard. Try opening the admin area if your app has one.

If login says “Invalid credentials”, go back to Supabase → SQL Editor and run this once:

```sql
INSERT INTO users (email, password_hash, name, role, city) VALUES 
  ('admin@135', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin User', 'admin', 'Mumbai')
ON CONFLICT (email) DO NOTHING;
```

Then try logging in again.

---

## Summary

| Step | Where | What you did |
|------|--------|----------------|
| 1 | Supabase | Ran `supabase_schema.sql` in SQL Editor |
| 2 | Supabase | Got/copied database password for `DATABASE_URL` |
| 3 | Render | Created Web Service from repo, root `backend`, set `DATABASE_URL` + `JWT_SECRET`, copied service URL |
| 4 | Vercel | Set `NEXT_PUBLIC_API_URL` = `https://<render-url>/api`, redeployed |
| 5 | Browser | Logged in at your site with `admin@135` / `password` |

After this, the project is live: **Vercel (frontend) + Render (backend) + Supabase (DB)**.
