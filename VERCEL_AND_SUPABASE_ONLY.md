# Get cpool.ai live with **only** Vercel + Supabase

No Railway, no Render. The API runs inside your Next.js app on Vercel and talks to Supabase.

---

## 1. Supabase – run the database script once

1. Open **https://supabase.com/dashboard/project/xmsfwmuqgzigkisjzhaw**
2. Go to **SQL Editor** → **New query**
3. Copy the **entire** contents of **`supabase_schema.sql`** (repo root) and paste into the editor
4. Click **Run**

You should see success. Admin user is created: **Email** `admin@135` **Password** `password`

---

## 2. Vercel – set environment variables

Your app (frontend + API) runs on Vercel. The API needs the database and a JWT secret.

1. Go to **https://vercel.com** → your **cpool.ai** project (the one that serves e.g. cpoolai.vercel.app)
2. **Settings** → **Environment Variables**
3. Add these (for **Production** and optionally **Preview**):

| Name | Value |
|------|--------|
| `DATABASE_URL` | Your Supabase Postgres connection string. In Supabase: **Settings** → **Database** → **Connection string** → **URI**. It looks like: `postgresql://postgres:YOUR_PASSWORD@db.xmsfwmuqgzigkisjzhaw.supabase.co:5432/postgres` |
| `JWT_SECRET` | Any long random string (e.g. 32+ characters). Use a password generator if you like. |

4. **Do not set** `NEXT_PUBLIC_API_URL` – the app uses `/api` on the same domain by default.

5. **Redeploy**: **Deployments** → **⋯** on latest deployment → **Redeploy**

---

## 3. Test the site

1. Open your site (e.g. **https://cpoolai.vercel.app/login**)
2. Log in with **admin@135** / **password**
3. You should land on the dashboard. Try **Offer Ride**, **Find Ride**, **Vehicles**, and **Admin** (if you’re admin).

---

## Summary

| Step | Where | What |
|------|--------|------|
| 1 | Supabase | Run `supabase_schema.sql` in SQL Editor once |
| 2 | Vercel | Add `DATABASE_URL` and `JWT_SECRET`, then redeploy |
| 3 | Browser | Log in at your site with `admin@135` / `password` |

**Stack:** Git (repo) → Vercel (Next.js + API routes) → Supabase (Postgres). No other services.
