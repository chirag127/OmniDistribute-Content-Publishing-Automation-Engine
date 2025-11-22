# Tumblr OAuth 1.0a Token Secret Generator
# This script guides you through obtaining the missing TUMBLR_TOKEN_SECRET

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Tumblr OAuth 1.0a Token Secret Generator" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Read credentials from .env
$envPath = Join-Path $PSScriptRoot ".env"
$envContent = Get-Content $envPath -Raw

$ConsumerKey = ""

if ($envContent -match 'TUMBLR_CONSUMER_KEY=([^\r\n]+)') {
    $ConsumerKey = $matches[1].Trim()
}

if ([string]::IsNullOrWhiteSpace($ConsumerKey)) {
    Write-Host "ERROR: TUMBLR_CONSUMER_KEY not found in .env" -ForegroundColor Red
    exit 1
}

$maskedKey = $ConsumerKey.Substring(0, [Math]::Min(10, $ConsumerKey.Length)) + "..."
Write-Host "[OK] Consumer Key: $maskedKey" -ForegroundColor Green
Write-Host ""

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  RECOMMENDED: Use Web Tool" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The easiest way to get your Token Secret:" -ForegroundColor White
Write-Host ""
Write-Host "  URL: https://mkromer.github.io/tumblr-oauth/" -ForegroundColor Green
Write-Host ""
Write-Host "Steps:" -ForegroundColor Yellow
Write-Host "  1. I will open the URL in your browser"
Write-Host "  2. Enter Consumer Key: $ConsumerKey" -ForegroundColor Cyan
Write-Host "  3. Enter Consumer Secret: [from your .env]" -ForegroundColor Cyan
Write-Host "  4. Click 'Authorize' and log in to Tumblr"
Write-Host "  5. Come back here with the tokens"
Write-Host ""

$response = Read-Host "Open the web tool now? (Y/n)"

if ($response -eq "" -or $response.ToUpper() -eq "Y") {
    Write-Host ""
    Write-Host "Opening browser..." -ForegroundColor Green
    Start-Process "https://mkromer.github.io/tumblr-oauth/"
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "[WAITING] Please complete authorization in browser" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$response2 = Read-Host "Have you completed the authorization? (Y/n)"

if ($response2 -eq "" -or $response2.ToUpper() -eq "Y") {
    Write-Host ""
    Write-Host "Great! Please enter the tokens you received:" -ForegroundColor Green
    Write-Host ""

    $accessToken = Read-Host "Enter OAuth Token (oauth_token)"
    $tokenSecret = Read-Host "Enter OAuth Token Secret (oauth_token_secret)"

    if ([string]::IsNullOrWhiteSpace($accessToken) -or [string]::IsNullOrWhiteSpace($tokenSecret)) {
        Write-Host ""
        Write-Host "ERROR: Both tokens are required" -ForegroundColor Red
        exit 1
    }

    # Update .env file
    Write-Host ""
    Write-Host "Updating .env file..." -ForegroundColor Yellow

    $newEnvContent = Get-Content $envPath -Raw

    # Update TUMBLR_TOKEN
    $newEnvContent = $newEnvContent -replace 'TUMBLR_TOKEN=[^\r\n]*', "TUMBLR_TOKEN=$accessToken"
    Write-Host "  [OK] Updated TUMBLR_TOKEN" -ForegroundColor Green

    # Update TUMBLR_ACCESS_TOKEN
    $newEnvContent = $newEnvContent -replace 'TUMBLR_ACCESS_TOKEN=[^\r\n]*', "TUMBLR_ACCESS_TOKEN=$accessToken"
    Write-Host "  [OK] Updated TUMBLR_ACCESS_TOKEN" -ForegroundColor Green

    # Update TUMBLR_TOKEN_SECRET
    $newEnvContent = $newEnvContent -replace 'TUMBLR_TOKEN_SECRET=[^\r\n]*', "TUMBLR_TOKEN_SECRET=$tokenSecret"
    Write-Host "  [OK] Updated TUMBLR_TOKEN_SECRET" -ForegroundColor Green

    Set-Content -Path $envPath -Value $newEnvContent -NoNewline

    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "[SUCCESS] Tumblr OAuth setup complete!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Configured credentials:" -ForegroundColor White
    Write-Host "  TUMBLR_CONSUMER_KEY: YES" -ForegroundColor Green
    Write-Host "  TUMBLR_CONSUMER_SECRET: YES" -ForegroundColor Green
    Write-Host "  TUMBLR_TOKEN: YES" -ForegroundColor Green
    Write-Host "  TUMBLR_TOKEN_SECRET: YES" -ForegroundColor Green
    Write-Host "  TUMBLR_ACCESS_TOKEN: YES" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "No problem! Run this script again when you are ready." -ForegroundColor Yellow
    Write-Host ""
}
