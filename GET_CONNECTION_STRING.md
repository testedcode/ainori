# 🔗 How to Get Supabase Database Connection String

## Your Project URL
`https://xmsfwmuqgzigkisjzhaw.supabase.co`

## Steps to Get Connection String

1. **Go to your Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Click on your project (the one with URL ending in `xmsfwmuqgzigkisjzhaw`)

2. **Navigate to Database Settings**
   - Click **Settings** (gear icon) in the left sidebar
   - Click **Database** in the settings menu

3. **Find Connection String**
   - Scroll down to **"Connection string"** section
   - You'll see tabs: **URI**, **JDBC**, **Golang**, etc.
   - Click on **"URI"** tab

4. **Copy the Connection String**
   - It will look like:
     ```
     postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
     ```
   - OR:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xmsfwmuqgzigkisjzhaw.supabase.co:5432/postgres
     ```

5. **Important: Replace [YOUR-PASSWORD]**
   - The connection string will have `[YOUR-PASSWORD]` placeholder
   - Replace it with your actual database password
   - This is the password you set when creating the project

## Alternative: Direct Connection String Format

Based on your project URL, your connection string should be:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xmsfwmuqgzigkisjzhaw.supabase.co:5432/postgres
```

**Just replace `[YOUR-PASSWORD]` with your actual password!**

## Can't Remember Password?

1. Go to Settings → Database
2. Look for "Database password" section
3. You can reset it if needed (but this will disconnect existing connections)
