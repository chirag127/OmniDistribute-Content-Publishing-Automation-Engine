# ========================================
# Hugo Site Build Script
# ========================================
# This script builds your Hugo site with PaperMod theme
# Run this in a NEW PowerShell window

Write-Host "🚀 Building Hugo site..." -ForegroundColor Cyan

# Navigate to project directory
Set-Location -Path "c:\AM\GitHub\Omni-Publisher-Content-Ecosystem"

# Check if Hugo is installed
try {
    $hugoVersion = hugo version
    Write-Host "✅ Hugo is installed: $hugoVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Hugo is not recognized. Please RESTART PowerShell and try again." -ForegroundColor Red
    Write-Host "   After restart, run this script again." -ForegroundColor Yellow
    exit 1
}

# Update submodules (PaperMod theme)
Write-Host "`n📦 Updating PaperMod theme..." -ForegroundColor Cyan
git submodule update --init --recursive

# Clean old build files
Write-Host "`n🧹 Cleaning old build files..." -ForegroundColor Cyan
if (Test-Path "public") {
    Remove-Item -Path "public" -Recurse -Force
    Write-Host "✅ Removed old public directory" -ForegroundColor Green
}
if (Test-Path "resources") {
    Remove-Item -Path "resources" -Recurse -Force
    Write-Host "✅ Removed old resources directory" -ForegroundColor Green
}

# Build site with Hugo
Write-Host "`n🔨 Building site with Hugo..." -ForegroundColor Cyan
hugo --minify

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Hugo build completed successfully!" -ForegroundColor Green
    Write-Host "`n📊 Build summary:" -ForegroundColor Cyan
    Get-ChildItem -Path "public" -Recurse | Measure-Object | Select-Object -ExpandProperty Count | ForEach-Object {
        Write-Host "   Total files generated: $_" -ForegroundColor White
    }

    Write-Host "`n🌐 To preview locally, run:" -ForegroundColor Yellow
    Write-Host "   hugo server -D" -ForegroundColor White
    Write-Host "`n📤 To deploy, commit and push:" -ForegroundColor Yellow
    Write-Host "   git add ." -ForegroundColor White
    Write-Host "   git commit -m 'Regenerate Hugo site'" -ForegroundColor White
    Write-Host "   git push origin main" -ForegroundColor White
} else {
    Write-Host "`n❌ Hugo build failed! Check errors above." -ForegroundColor Red
    exit 1
}
