# 🔧 Fix Go PATH Issue

## Problem
Go is installed but PowerShell can't find it because it's not in PATH.

## Quick Fix (Temporary - This Session Only)

Run this in PowerShell:
```powershell
$env:Path += ";C:\Program Files\Go\bin"
go version
```

If that works, Go is installed but not in PATH permanently.

## Permanent Fix

### Option 1: Restart PowerShell
Sometimes Go installer adds to PATH but you need to restart:
1. Close PowerShell completely
2. Open new PowerShell window
3. Try `go version` again

### Option 2: Add to PATH Manually

1. **Find Go installation:**
   ```powershell
   Test-Path "C:\Program Files\Go\bin\go.exe"
   ```
   If `True`, Go is at: `C:\Program Files\Go\bin`

2. **Add to System PATH:**
   - Press `Win + X` → System
   - Advanced System Settings
   - Environment Variables
   - Under "System variables", find "Path" → Edit
   - New → Add: `C:\Program Files\Go\bin`
   - OK → OK → OK
   - **Restart PowerShell**

### Option 3: Reinstall Go
If Go isn't installed:
1. Download: https://golang.org/dl/
2. Install the `.msi` file
3. **Restart PowerShell** after installation

## Verify Installation

After fixing PATH, verify:
```powershell
go version
```

Should show: `go version go1.21.x windows/amd64`

## Continue Setup

Once Go works:
```powershell
cd backend
go mod download
go run cmd/migrate/main.go
```
