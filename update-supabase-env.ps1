# Quick script to update backend/.env with Supabase connection string
Write-Host "🔗 Updating Supabase Connection String" -ForegroundColor Cyan
Write-Host ""

# Project details
$projectRef = "xmsfwmuqgzigkisjzhaw"
$projectUrl = "https://$projectRef.supabase.co"

Write-Host "Project: $projectUrl" -ForegroundColor Green
Write-Host ""

# Get database password
Write-Host "Enter your Supabase database password:" -ForegroundColor Yellow
Write-Host "(This is the password you set when creating the project)" -ForegroundColor Gray
$password = Read-Host "Password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

if ([string]::IsNullOrWhiteSpace($passwordPlain)) {
    Write-Host "✗ Password cannot be empty" -ForegroundColor Red
    exit 1
}

# URL encode password (handle special characters)
$encodedPassword = [System.Web.HttpUtility]::UrlEncode($passwordPlain)

# Create connection string
# Try direct connection first (port 5432)
$connectionString = "postgresql://postgres:$encodedPassword@db.$projectRef.supabase.co:5432/postgres"

Write-Host ""
Write-Host "📝 Creating connection string..." -ForegroundColor Yellow
Write-Host "Connection: postgresql://postgres:***@db.$projectRef.supabase.co:5432/postgres" -ForegroundColor Gray

# Ensure backend/.env exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating backend/.env..." -ForegroundColor Yellow
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
    } else {
        @"
PORT=8080
DATABASE_URL=
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
"@ | Out-File -FilePath "backend\.env" -Encoding utf8
    }
}

# Update .env file
Write-Host "Updating backend/.env..." -ForegroundColor Yellow
$envContent = Get-Content "backend\.env" -Raw

# Replace or add DATABASE_URL
if ($envContent -match "DATABASE_URL=") {
    $envContent = $envContent -replace "DATABASE_URL=.*", "DATABASE_URL=$connectionString"
} else {
    $envContent += "`nDATABASE_URL=$connectionString"
}

Set-Content -Path "backend\.env" -Value $envContent -NoNewline
Write-Host "✓ Updated backend/.env" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Configuration updated!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Test connection:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   go run cmd/migrate/main.go" -ForegroundColor Gray
Write-Host ""
Write-Host "2. If successful, start backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   go run main.go" -ForegroundColor Gray
Write-Host ""

# Ask if user wants to test now
$testNow = Read-Host "Do you want to test the connection now? (y/n)"
if ($testNow -eq "y" -or $testNow -eq "Y") {
    Write-Host ""
    Write-Host "🔍 Testing database connection..." -ForegroundColor Yellow
    
    if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
        Write-Host "⚠ Go not found. Please install Go first." -ForegroundColor Yellow
        Write-Host "   Download: https://golang.org/dl/" -ForegroundColor Gray
        exit 0
    }
    
    Set-Location backend
    go run cmd/migrate/main.go
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Connection successful! Database is ready." -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Setup complete! You can now:" -ForegroundColor Cyan
        Write-Host "   - Start backend: go run main.go" -ForegroundColor White
        Write-Host "   - Start frontend: cd ../frontend && npm run dev" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Connection failed. Please check:" -ForegroundColor Red
        Write-Host "   - Password is correct" -ForegroundColor Yellow
        Write-Host "   - Project is active (not paused)" -ForegroundColor Yellow
        Write-Host "   - Internet connection is working" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "💡 Tip: Try getting connection string from Supabase dashboard:" -ForegroundColor Cyan
        Write-Host "   Settings → Database → Connection string → URI" -ForegroundColor Gray
    }
    
    Set-Location ..
}

Write-Host ""
Write-Host "📚 Connection string saved to backend/.env" -ForegroundColor Cyan
