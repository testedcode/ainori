# PowerShell script for Windows local setup
Write-Host "🚗 Setting up cpool.ai locally..." -ForegroundColor Cyan

# Check Node.js
Write-Host "`n📦 Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check Go
Write-Host "`n🔧 Checking Go..." -ForegroundColor Yellow
if (Get-Command go -ErrorAction SilentlyContinue) {
    $goVersion = go version
    Write-Host "✓ Go found: $goVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Go not found. Please install Go 1.21+ from https://golang.org" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host "`n🗄️  Checking PostgreSQL..." -ForegroundColor Yellow
if (Get-Command psql -ErrorAction SilentlyContinue) {
    Write-Host "✓ PostgreSQL found" -ForegroundColor Green
} else {
    Write-Host "⚠ PostgreSQL not found in PATH. Make sure PostgreSQL is installed." -ForegroundColor Yellow
    Write-Host "  Install from https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

# Create .env files
Write-Host "`n📝 Creating environment files..." -ForegroundColor Yellow

if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✓ Created backend/.env" -ForegroundColor Green
    Write-Host "  ⚠ Please edit backend/.env with your database credentials" -ForegroundColor Yellow
} else {
    Write-Host "✓ backend/.env already exists" -ForegroundColor Green
}

if (-not (Test-Path "frontend\.env.local")) {
    Copy-Item "frontend\.env.local.example" "frontend\.env.local"
    Write-Host "✓ Created frontend/.env.local" -ForegroundColor Green
} else {
    Write-Host "✓ frontend/.env.local already exists" -ForegroundColor Green
}

# Install frontend dependencies
Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Install backend dependencies
Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
go mod download
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Set up PostgreSQL database:" -ForegroundColor White
Write-Host "   createdb cpool" -ForegroundColor Gray
Write-Host "   OR: psql -U postgres -c 'CREATE DATABASE cpool;'" -ForegroundColor Gray
Write-Host "`n2. Update backend/.env with your database credentials" -ForegroundColor White
Write-Host "`n3. Run migrations:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   go run cmd/migrate/main.go" -ForegroundColor Gray
Write-Host "`n4. Start backend (in one terminal):" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   go run main.go" -ForegroundColor Gray
Write-Host "`n5. Start frontend (in another terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "`n6. Open http://localhost:3000" -ForegroundColor White
Write-Host "`n🔐 Default admin login:" -ForegroundColor Cyan
Write-Host "   Email: admin@135" -ForegroundColor White
Write-Host "   Password: admin" -ForegroundColor White
