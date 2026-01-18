# Quick Supabase Configuration Script
Write-Host "`n=== Supabase Configuration ===" -ForegroundColor Cyan
Write-Host ""

$projectRef = "xmsfwmuqgzigkisjzhaw"
Write-Host "Project: $projectRef.supabase.co" -ForegroundColor Green
Write-Host ""

Write-Host "Enter your Supabase database password:" -ForegroundColor Yellow
Write-Host "(The password you set when creating the project)" -ForegroundColor Gray
$password = Read-Host "Password"

if ([string]::IsNullOrWhiteSpace($password)) {
    Write-Host "`n⚠️  No password provided. Skipping configuration." -ForegroundColor Yellow
    Write-Host "You can configure it manually in backend/.env" -ForegroundColor Gray
    exit 0
}

# URL encode password
Add-Type -AssemblyName System.Web
$encodedPassword = [System.Web.HttpUtility]::UrlEncode($password)

# Create connection string
$connectionString = "postgresql://postgres:$encodedPassword@db.$projectRef.supabase.co:5432/postgres"

Write-Host "`n📝 Updating backend/.env..." -ForegroundColor Yellow

# Read current .env
$envContent = Get-Content "backend\.env" -Raw

# Replace or add DATABASE_URL
if ($envContent -match "DATABASE_URL=") {
    $envContent = $envContent -replace "DATABASE_URL=.*", "DATABASE_URL=$connectionString"
} else {
    $envContent += "`nDATABASE_URL=$connectionString"
}

# Save
Set-Content -Path "backend\.env" -Value $envContent -NoNewline

Write-Host "✅ Supabase connection configured!" -ForegroundColor Green
Write-Host ""
Write-Host "Connection string format:" -ForegroundColor Gray
Write-Host "postgresql://postgres:***@db.$projectRef.supabase.co:5432/postgres" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Ready to test connection!" -ForegroundColor Green
