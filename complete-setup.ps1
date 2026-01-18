# Complete Setup Script for cpool.ai
Write-Host "🚀 Complete Setup for cpool.ai" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking Prerequisites..." -ForegroundColor Yellow
Write-Host ""

$nodeInstalled = $false
$goInstalled = $false

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Gray
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
        $nodeInstalled = $true
    }
} catch {
    Write-Host "❌ Node.js: NOT INSTALLED" -ForegroundColor Red
}

# Check Go
Write-Host "Checking Go..." -ForegroundColor Gray
try {
    $goVersion = go version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Go: $goVersion" -ForegroundColor Green
        $goInstalled = $true
    }
} catch {
    Write-Host "❌ Go: NOT INSTALLED" -ForegroundColor Red
}

Write-Host ""

# If Go is not installed, guide user
if (-not $goInstalled) {
    Write-Host "⚠ Go is required for the backend!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please install Go:" -ForegroundColor White
    Write-Host "1. Download: https://golang.org/dl/" -ForegroundColor Gray
    Write-Host "2. Install the .msi file" -ForegroundColor Gray
    Write-Host "3. Restart PowerShell" -ForegroundColor Gray
    Write-Host "4. Run this script again" -ForegroundColor Gray
    Write-Host ""
    $continue = Read-Host "Do you want to continue with frontend setup only? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 0
    }
}

# Create environment files
Write-Host ""
Write-Host "📝 Creating Environment Files..." -ForegroundColor Yellow

# Backend .env
if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating backend/.env..." -ForegroundColor Gray
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
    } else {
        @"
PORT=8080
DATABASE_URL=
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-change-this
"@ | Out-File -FilePath "backend\.env" -Encoding utf8
    }
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
} else {
    Write-Host "✅ backend/.env already exists" -ForegroundColor Green
}

# Frontend .env.local
if (-not (Test-Path "frontend\.env.local")) {
    Write-Host "Creating frontend/.env.local..." -ForegroundColor Gray
    if (Test-Path "frontend\.env.local.example") {
        Copy-Item "frontend\.env.local.example" "frontend\.env.local"
    } else {
        @"
NEXT_PUBLIC_API_URL=http://localhost:8080/api
"@ | Out-File -FilePath "frontend\.env.local" -Encoding utf8
    }
    Write-Host "✅ Created frontend/.env.local" -ForegroundColor Green
} else {
    Write-Host "✅ frontend/.env.local already exists" -ForegroundColor Green
}

Write-Host ""

# Setup Supabase
Write-Host "🔗 Supabase Setup..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Your Supabase project: xmsfwmuqgzigkisjzhaw.supabase.co" -ForegroundColor Cyan
Write-Host ""
Write-Host "To get your connection string:" -ForegroundColor White
Write-Host "1. Go to: https://app.supabase.com" -ForegroundColor Gray
Write-Host "2. Select your project" -ForegroundColor Gray
Write-Host "3. Settings -> Database -> Connection string -> URI" -ForegroundColor Gray
Write-Host "4. Copy the connection string" -ForegroundColor Gray
Write-Host ""

$setupSupabase = Read-Host "Do you want to setup Supabase connection now? (y/n)"
if ($setupSupabase -eq "y" -or $setupSupabase -eq "Y") {
    Write-Host ""
    Write-Host "Enter your Supabase database password:" -ForegroundColor Yellow
    Write-Host "(This is the password you set when creating the project)" -ForegroundColor Gray
    $password = Read-Host "Password" -AsSecureString
    $passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    )
    
    if (-not [string]::IsNullOrWhiteSpace($passwordPlain)) {
        $projectRef = "xmsfwmuqgzigkisjzhaw"
        $encodedPassword = [System.Web.HttpUtility]::UrlEncode($passwordPlain)
        $connectionString = "postgresql://postgres:$encodedPassword@db.$projectRef.supabase.co:5432/postgres"
        
        # Update .env file
        $envContent = Get-Content "backend\.env" -Raw
        if ($envContent -match "DATABASE_URL=") {
            $envContent = $envContent -replace "DATABASE_URL=.*", "DATABASE_URL=$connectionString"
        } else {
            $envContent += "`nDATABASE_URL=$connectionString"
        }
        Set-Content -Path "backend\.env" -Value $envContent -NoNewline
        
        Write-Host "✅ Supabase connection configured!" -ForegroundColor Green
    } else {
        Write-Host "⚠ Password not provided. You can set it later in backend/.env" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ Skipping Supabase setup. Configure manually in backend/.env" -ForegroundColor Yellow
}

Write-Host ""

# Install dependencies
Write-Host "📦 Installing Dependencies..." -ForegroundColor Yellow
Write-Host ""

# Frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Gray
Set-Location frontend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Set-Location ..

# Backend dependencies (only if Go is installed)
if ($goInstalled) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Gray
    Set-Location backend
    go mod download
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠ Failed to install backend dependencies" -ForegroundColor Yellow
    }
    Set-Location ..
} else {
    Write-Host "⚠ Skipping backend dependencies (Go not installed)" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

if (-not $goInstalled) {
    Write-Host "⚠ IMPORTANT: Go is not installed!" -ForegroundColor Yellow
    Write-Host "   Install Go to continue: https://golang.org/dl/" -ForegroundColor White
    Write-Host ""
}

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""

if ($goInstalled) {
    Write-Host "1. Run database migrations:" -ForegroundColor White
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   go run cmd/migrate/main.go" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Start backend (Terminal 1):" -ForegroundColor White
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   go run main.go" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "1. Install Go: https://golang.org/dl/" -ForegroundColor White
    Write-Host "   Then restart PowerShell and run migrations" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "3. Start frontend (Terminal 2):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "🔐 Default Admin Login:" -ForegroundColor Cyan
Write-Host "   Email: admin@135" -ForegroundColor White
Write-Host "   Password: admin" -ForegroundColor White
Write-Host ""

if (-not (Test-Path "backend\.env") -or (Get-Content "backend\.env" -Raw) -notmatch "DATABASE_URL=postgresql://") {
    Write-Host "⚠ Remember to configure Supabase connection in backend/.env" -ForegroundColor Yellow
    Write-Host "   Or run: .\update-supabase-env.ps1" -ForegroundColor Gray
    Write-Host ""
}
