# PowerShell script to start both backend and frontend
Write-Host "🚀 Starting cpool.ai development servers..." -ForegroundColor Cyan

# Check if .env files exist
if (-not (Test-Path "backend\.env")) {
    Write-Host "✗ backend/.env not found. Run setup-local.ps1 first" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "frontend\.env.local")) {
    Write-Host "✗ frontend/.env.local not found. Run setup-local.ps1 first" -ForegroundColor Red
    exit 1
}

# Start backend in background
Write-Host "`n🔧 Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host 'Backend starting on http://localhost:8080' -ForegroundColor Green; go run main.go"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "`n🎨 Starting frontend server..." -ForegroundColor Yellow
Write-Host "Frontend will open at http://localhost:3000" -ForegroundColor Green
Write-Host "`nPress Ctrl+C to stop both servers" -ForegroundColor Yellow
cd frontend
npm run dev
