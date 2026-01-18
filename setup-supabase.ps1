# PowerShell script to help setup Supabase
Write-Host "🚀 Supabase Setup Helper for cpool.ai" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 What I need from you:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Supabase Project Connection String" -ForegroundColor White
Write-Host "   - Go to: https://app.supabase.com" -ForegroundColor Gray
Write-Host "   - Select your project (or create new)" -ForegroundColor Gray
Write-Host "   - Settings → Database → Connection string → URI" -ForegroundColor Gray
Write-Host "   - Copy the connection string" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Your Database Password" -ForegroundColor White
Write-Host "   - The password you set when creating the project" -ForegroundColor Gray
Write-Host ""

# Check if .env exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "📝 Creating backend/.env file..." -ForegroundColor Yellow
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "✓ Created backend/.env from template" -ForegroundColor Green
    } else {
        # Create basic .env
        @"
PORT=8080
DATABASE_URL=
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
"@ | Out-File -FilePath "backend\.env" -Encoding utf8
        Write-Host "✓ Created backend/.env" -ForegroundColor Green
    }
} else {
    Write-Host "✓ backend/.env already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔗 Step 1: Get Connection String from Supabase" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Go to: https://app.supabase.com" -ForegroundColor White
Write-Host "2. Select your project (or create new one)" -ForegroundColor White
Write-Host "3. Click Settings (gear icon) → Database" -ForegroundColor White
Write-Host "4. Scroll to 'Connection string' section" -ForegroundColor White
Write-Host "5. Click 'URI' tab" -ForegroundColor White
Write-Host "6. Copy the connection string" -ForegroundColor White
Write-Host ""
Write-Host "It should look like:" -ForegroundColor Yellow
Write-Host "postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres" -ForegroundColor Gray
Write-Host ""

# Prompt for connection string
$connectionString = Read-Host "Paste your Supabase connection string here"

if ([string]::IsNullOrWhiteSpace($connectionString)) {
    Write-Host "✗ No connection string provided. Exiting." -ForegroundColor Red
    Write-Host ""
    Write-Host "You can manually edit backend/.env and add:" -ForegroundColor Yellow
    Write-Host "DATABASE_URL=your_connection_string_here" -ForegroundColor Gray
    exit 1
}

# Check if password placeholder exists
if ($connectionString -match "\[YOUR-PASSWORD\]") {
    Write-Host ""
    Write-Host "⚠ Found [YOUR-PASSWORD] placeholder" -ForegroundColor Yellow
    $password = Read-Host "Enter your database password"
    
    if (-not [string]::IsNullOrWhiteSpace($password)) {
        # URL encode special characters
        $encodedPassword = [System.Web.HttpUtility]::UrlEncode($password)
        $connectionString = $connectionString -replace "\[YOUR-PASSWORD\]", $encodedPassword
        Write-Host "✓ Password added to connection string" -ForegroundColor Green
    }
}

# Update .env file
Write-Host ""
Write-Host "📝 Updating backend/.env..." -ForegroundColor Yellow

$envContent = Get-Content "backend\.env" -Raw

# Replace DATABASE_URL line
if ($envContent -match "DATABASE_URL=") {
    $envContent = $envContent -replace "DATABASE_URL=.*", "DATABASE_URL=$connectionString"
} else {
    # Add DATABASE_URL if it doesn't exist
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
Write-Host "3. Start frontend (in another terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

# Ask if user wants to test connection now
$testNow = Read-Host "Do you want to test the connection now? (y/n)"
if ($testNow -eq "y" -or $testNow -eq "Y") {
    Write-Host ""
    Write-Host "🔍 Testing database connection..." -ForegroundColor Yellow
    Set-Location backend
    
    # Check if Go is available
    if (Get-Command go -ErrorAction SilentlyContinue) {
        go run cmd/migrate/main.go
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Connection successful! Database is ready." -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "❌ Connection failed. Please check:" -ForegroundColor Red
            Write-Host "   - Connection string is correct" -ForegroundColor Yellow
            Write-Host "   - Password is correct" -ForegroundColor Yellow
            Write-Host "   - Project is active (not paused)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠ Go not found. Please test manually:" -ForegroundColor Yellow
        Write-Host "   cd backend" -ForegroundColor Gray
        Write-Host "   go run cmd/migrate/main.go" -ForegroundColor Gray
    }
    
    Set-Location ..
}

Write-Host ""
Write-Host "📚 For detailed instructions, see SUPABASE_SETUP.md" -ForegroundColor Cyan
