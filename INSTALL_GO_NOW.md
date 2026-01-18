# 📥 Install Go - Step by Step

## Quick Installation Guide

### Step 1: Download Go

👉 **Direct Download Link:** https://golang.org/dl/

**What to download:**
- Look for: **"Microsoft Windows"** section
- File: `go1.21.x.windows-amd64.msi` (or latest version)
- Click to download

### Step 2: Install Go

1. **Run the downloaded `.msi` file**
2. **Click "Next"** through all steps
3. **Keep default options:**
   - Installation path: `C:\Program Files\Go` (default)
   - Keep all checkboxes checked
4. **Click "Install"**
5. **Wait for installation to complete**
6. **Click "Finish"**

### Step 3: Restart PowerShell ⚠️ IMPORTANT!

**You MUST restart PowerShell for Go to work:**

1. **Close this PowerShell window completely**
2. **Open a NEW PowerShell window**
3. **Navigate back to project:**
   ```powershell
   cd C:\Users\abhi8\Desktop\ainori
   ```

### Step 4: Verify Installation

In the NEW PowerShell window, run:
```powershell
go version
```

**Expected output:**
```
go version go1.21.x windows/amd64
```

If you see this, Go is installed correctly! ✅

### Step 5: Continue Setup

Once Go is verified, run:
```powershell
cd backend
go mod download
go run cmd/migrate/main.go
```

---

## Troubleshooting

### "go is not recognized" After Installation?

**Solution:**
1. Make sure you **restarted PowerShell** (not just refreshed)
2. Check if Go is installed:
   ```powershell
   Test-Path "C:\Program Files\Go\bin\go.exe"
   ```
   Should return `True`

3. If installed but not working, add to PATH manually:
   - Press `Win + X` → System
   - Advanced System Settings → Environment Variables
   - System Variables → Path → Edit
   - New → Add: `C:\Program Files\Go\bin`
   - OK → OK → OK
   - **Restart PowerShell**

### Installation Fails?

- Make sure you have admin rights
- Try running installer as Administrator
- Check Windows Defender isn't blocking it

---

## After Installation

Once Go is installed and verified:

1. **Install backend dependencies:**
   ```powershell
   cd backend
   go mod download
   ```

2. **Run database migrations:**
   ```powershell
   go run cmd/migrate/main.go
   ```

3. **Start backend:**
   ```powershell
   go run main.go
   ```

4. **Start frontend (new terminal):**
   ```powershell
   cd frontend
   npm run dev
   ```

---

**Ready? Download and install Go, then restart PowerShell!** 🚀
