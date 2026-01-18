# 🚀 Supabase Setup Guide for cpool.ai

## Step-by-Step Instructions

### Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Login with your account

2. **Create New Project**
   - Click "New Project" button (top right)
   - **Organization:** Select your organization (or create one)
   - **Name:** `cpool` (or `cpool-ai`)
   - **Database Password:** 
     - Set a **strong password** (you'll need this!)
     - **Save this password somewhere safe!**
     - Example: `MySecurePassword123!`
   - **Region:** Choose closest to you (e.g., `Southeast Asia (Mumbai)` or `US East`)
   - **Pricing Plan:** Free (Hobby)
   - Click **"Create new project"**

3. **Wait for Project Setup**
   - This takes 1-2 minutes
   - Wait for "Your project is ready" message

### Step 2: Get Connection String

1. **Go to Project Settings**
   - Click **Settings** (gear icon) in left sidebar
   - Click **Database** in settings menu

2. **Find Connection String**
   - Scroll down to **"Connection string"** section
   - Look for **"URI"** tab (not "JDBC" or "Golang")
   - You'll see something like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
     ```

3. **Copy the Connection String**
   - Click the **copy icon** next to the URI
   - **Important:** Replace `[YOUR-PASSWORD]` with your actual password!
   - Example:
     ```
     postgresql://postgres:MySecurePassword123!@db.xxxxx.supabase.co:5432/postgres
     ```

### Step 3: Update backend/.env

1. **Open backend/.env file**
   ```powershell
   notepad backend\.env
   ```

2. **Update DATABASE_URL**
   - Find the line: `DATABASE_URL=...`
   - Replace with your Supabase connection string:
     ```env
     DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
     ```
   - **Make sure to replace `YOUR_PASSWORD` with your actual password!**

3. **Save the file**

### Step 4: Test Connection

Run this to test:
```powershell
cd backend
go run cmd/migrate/main.go
```

You should see:
```
Database connection established
Database migrations completed
```

### Step 5: Verify in Supabase Dashboard

1. Go back to Supabase Dashboard
2. Click **"Table Editor"** in left sidebar
3. You should see tables created:
   - `users`
   - `cities`
   - `corridors`
   - `vehicles`
   - `rides`
   - etc.

## ✅ Setup Complete!

Your database is now ready. Continue with:
1. Start backend: `cd backend && go run main.go`
2. Start frontend: `cd frontend && npm run dev`

## 🔐 Security Notes

- **Never commit `.env` file to Git!**
- Keep your database password secure
- The `.env` file is already in `.gitignore`

## 🆘 Troubleshooting

### Connection Failed?
- Check password is correct (no spaces, special characters encoded)
- Verify connection string format
- Check if project is active (not paused)

### Password with Special Characters?
If your password has special characters, URL encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `&` → `%26`
- `!` → `%21`

Or use Supabase's connection pooler (see below).

### Using Connection Pooler (Optional)

For better performance, use the connection pooler:
1. Go to Settings → Database
2. Find "Connection pooling" section
3. Use "Session" mode connection string
4. Port will be `6543` instead of `5432`

## 📝 Example .env File

```env
PORT=8080
DATABASE_URL=postgresql://postgres:YourPassword123!@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
```

---

**Need help?** Check Supabase docs: https://supabase.com/docs
