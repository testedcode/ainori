# PowerShell script to setup PostgreSQL with Docker
Write-Host "🐳 Setting up PostgreSQL with Docker..." -ForegroundColor Cyan

# Check if Docker is installed
Write-Host "`n📦 Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found!" -ForegroundColor Red
    Write-Host "`nPlease install Docker Desktop:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://www.docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host "2. Install Docker Desktop" -ForegroundColor White
    Write-Host "3. Start Docker Desktop" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    exit 1
}

# Check if Docker is running
Write-Host "`n🔍 Checking if Docker is running..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    exit 1
}

# Check if container already exists
Write-Host "`n🔍 Checking for existing container..." -ForegroundColor Yellow
$existingContainer = docker ps -a --filter "name=cpool-db" --format "{{.Names}}"
if ($existingContainer -eq "cpool-db") {
    Write-Host "⚠ Container 'cpool-db' already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to remove and recreate it? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "Removing existing container..." -ForegroundColor Yellow
        docker stop cpool-db 2>$null
        docker rm cpool-db 2>$null
        Write-Host "✓ Container removed" -ForegroundColor Green
    } else {
        Write-Host "Using existing container..." -ForegroundColor Yellow
        docker start cpool-db 2>$null
        Write-Host "✓ Container started" -ForegroundColor Green
        Write-Host "`n✅ PostgreSQL is ready!" -ForegroundColor Green
        Write-Host "`n📝 Database Details:" -ForegroundColor Cyan
        Write-Host "   Host: localhost" -ForegroundColor White
        Write-Host "   Port: 5432" -ForegroundColor White
        Write-Host "   Database: cpool" -ForegroundColor White
        Write-Host "   Username: postgres" -ForegroundColor White
        Write-Host "   Password: postgres123" -ForegroundColor White
        Write-Host "`nUpdate backend/.env with:" -ForegroundColor Yellow
        Write-Host "DATABASE_URL=postgres://postgres:postgres123@localhost:5432/cpool?sslmode=disable" -ForegroundColor Gray
        exit 0
    }
}

# Set password
$POSTGRES_PASSWORD = "postgres123"
Write-Host "`n🔐 Using password: $POSTGRES_PASSWORD" -ForegroundColor Yellow
Write-Host "   (You can change this in the script if needed)" -ForegroundColor Gray

# Pull PostgreSQL image if not exists
Write-Host "`n📥 Pulling PostgreSQL image..." -ForegroundColor Yellow
docker pull postgres:14
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Image pulled" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to pull image" -ForegroundColor Red
    exit 1
}

# Create and start container
Write-Host "`n🚀 Creating PostgreSQL container..." -ForegroundColor Yellow
docker run --name cpool-db `
  -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD `
  -e POSTGRES_DB=cpool `
  -p 5432:5432 `
  -d postgres:14

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Container created and started" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to create container" -ForegroundColor Red
    exit 1
}

# Wait for PostgreSQL to be ready
Write-Host "`n⏳ Waiting for PostgreSQL to start..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    Start-Sleep -Seconds 2
    $attempt++
    try {
        $result = docker exec cpool-db psql -U postgres -d cpool -c "SELECT 1;" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $ready = $true
        }
    } catch {
        # Continue waiting
    }
    Write-Host "." -NoNewline -ForegroundColor Gray
}

Write-Host ""

if ($ready) {
    Write-Host "✓ PostgreSQL is ready!" -ForegroundColor Green
} else {
    Write-Host "⚠ PostgreSQL might still be starting. Please wait a moment." -ForegroundColor Yellow
}

# Test connection
Write-Host "`n🔍 Testing database connection..." -ForegroundColor Yellow
$testResult = docker exec cpool-db psql -U postgres -d cpool -c "SELECT version();" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database connection successful!" -ForegroundColor Green
} else {
    Write-Host "⚠ Connection test failed, but container is running" -ForegroundColor Yellow
}

# Create .env file if it doesn't exist
Write-Host "`n📝 Updating backend/.env..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "✓ Created backend/.env from template" -ForegroundColor Green
    } else {
        # Create .env file
        @"
PORT=8080
DATABASE_URL=postgres://postgres:$POSTGRES_PASSWORD@localhost:5432/cpool?sslmode=disable
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
"@ | Out-File -FilePath "backend\.env" -Encoding utf8
        Write-Host "✓ Created backend/.env" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ backend/.env already exists" -ForegroundColor Yellow
    Write-Host "   Please update DATABASE_URL manually:" -ForegroundColor White
    Write-Host "   DATABASE_URL=postgres://postgres:$POSTGRES_PASSWORD@localhost:5432/cpool?sslmode=disable" -ForegroundColor Gray
}

# Update .env file with correct DATABASE_URL
$envContent = Get-Content "backend\.env" -Raw
$newEnvContent = $envContent -replace "DATABASE_URL=.*", "DATABASE_URL=postgres://postgres:$POSTGRES_PASSWORD@localhost:5432/cpool?sslmode=disable"
Set-Content -Path "backend\.env" -Value $newEnvContent -NoNewline
Write-Host "✓ Updated DATABASE_URL in backend/.env" -ForegroundColor Green

Write-Host "`n✅ PostgreSQL setup complete!" -ForegroundColor Green
Write-Host "`n📋 Database Details:" -ForegroundColor Cyan
Write-Host "   Host: localhost" -ForegroundColor White
Write-Host "   Port: 5432" -ForegroundColor White
Write-Host "   Database: cpool" -ForegroundColor White
Write-Host "   Username: postgres" -ForegroundColor White
Write-Host "   Password: $POSTGRES_PASSWORD" -ForegroundColor White

Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run migrations:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   go run cmd/migrate/main.go" -ForegroundColor Gray
Write-Host "`n2. Start backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   go run main.go" -ForegroundColor Gray
Write-Host "`n3. Start frontend:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray

Write-Host "`n💡 Useful Commands:" -ForegroundColor Cyan
Write-Host "   Stop database: docker stop cpool-db" -ForegroundColor Gray
Write-Host "   Start database: docker start cpool-db" -ForegroundColor Gray
Write-Host "   View logs: docker logs cpool-db" -ForegroundColor Gray
Write-Host "   Connect to DB: docker exec -it cpool-db psql -U postgres -d cpool" -ForegroundColor Gray
