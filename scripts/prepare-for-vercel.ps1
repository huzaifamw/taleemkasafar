# VERCEL DEPLOYMENT PREPARATION SCRIPT

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  VERCEL DEPLOYMENT PREPARATION" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Run from project root" -ForegroundColor Red
    exit 1
}

Write-Host "[1/5] Creating backup..." -ForegroundColor Yellow
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDir = "deployment-backup-$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
if (Test-Path ".env.local") {
    Copy-Item ".env.local" "$backupDir/.env.local.backup"
}
Write-Host "   Backup created: $backupDir" -ForegroundColor Green
Write-Host ""

Write-Host "[2/5] Checking environment files..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "   No .env.local found" -ForegroundColor Yellow
    Write-Host "   Add environment variables in Vercel dashboard" -ForegroundColor Yellow
} else {
    Write-Host "   .env.local exists" -ForegroundColor Green
}

if (-not (Test-Path ".env.example")) {
    Write-Host "   No .env.example" -ForegroundColor Yellow
} else {
    Write-Host "   .env.example exists" -ForegroundColor Green
}
Write-Host ""

Write-Host "[3/5] Testing build..." -ForegroundColor Yellow
Write-Host "   Running: npm run build" -ForegroundColor Gray
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Build successful!" -ForegroundColor Green
} else {
    Write-Host "   Build failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Build errors:" -ForegroundColor Red
    Write-Host $buildOutput -ForegroundColor Gray
    Write-Host ""
    Write-Host "Fix build errors before deploying" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

Write-Host "[4/5] Checking for sensitive files..." -ForegroundColor Yellow
$envPattern = "\.env"
$trackedEnv = git ls-files | Select-String -Pattern $envPattern
if ($trackedEnv) {
    Write-Host "   WARNING: .env files tracked in Git" -ForegroundColor Red
    Write-Host "   Run: git rm --cached .env*" -ForegroundColor Yellow
} else {
    Write-Host "   No sensitive files in Git" -ForegroundColor Green
}
Write-Host ""

Write-Host "[5/5] Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "   Uncommitted changes found" -ForegroundColor Yellow
} else {
    Write-Host "   Working directory clean" -ForegroundColor Green
}
Write-Host ""

Write-Host "============================================" -ForegroundColor Green
Write-Host "  PREPARATION COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Commit changes:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host '   git commit -m "chore: prepare for Vercel deployment"' -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Go to https://vercel.com" -ForegroundColor White
Write-Host "   - Sign in with GitHub" -ForegroundColor Gray
Write-Host "   - Click Add New Project" -ForegroundColor Gray
Write-Host "   - Import taleemkasafar repository" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Add environment variables in Vercel:" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Gray
Write-Host "   GEMINI_API_KEY (optional)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Click Deploy and wait 2-5 minutes" -ForegroundColor White
Write-Host ""
Write-Host "Backup saved to: $backupDir" -ForegroundColor Yellow
Write-Host ""
