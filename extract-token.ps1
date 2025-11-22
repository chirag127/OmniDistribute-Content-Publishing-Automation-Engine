#!/usr/bin/env pwsh
# Extract and decode OAuth token from callback URL

$callbackUrl = "http://localhost:3000/callback#access_token=I%296el%2AEum%40W50o8TT6%21YvqP3%21bbO9Wd%23xkjqHGFXo0yj0ls%21DnsL%2AbH%40fe9Onrho&expires_in=1209600&token_type=bearer&site_id=0&scope=global"

# Parse URL fragment
if ($callbackUrl -match '#(.+)$') {
    $fragment = $matches[1]

    # Parse query parameters
    $params = @{}
    $fragment -split '&' | ForEach-Object {
        if ($_ -match '^([^=]+)=(.+)$') {
            $key = $matches[1]
            $value = [System.Web.HttpUtility]::UrlDecode($matches[2])
            $params[$key] = $value
        }
    }

    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "  WordPress.com OAuth Token Extracted" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Access Token:  " -NoNewline
    Write-Host $params['access_token'] -ForegroundColor Green
    Write-Host "Token Type:    " -NoNewline
    Write-Host $params['token_type']
    Write-Host "Expires In:    " -NoNewline
    Write-Host "$($params['expires_in']) seconds ($([math]::Round($params['expires_in'] / 86400)) days)"
    Write-Host "Scope:         " -NoNewline
    Write-Host $params['scope']
    Write-Host "Site ID:       " -NoNewline
    Write-Host $params['site_id'] -ForegroundColor Yellow
    Write-Host ""

    # Update .env file
    Write-Host "Updating .env file..." -ForegroundColor Yellow
    $envPath = Join-Path $PSScriptRoot ".env"
    $envContent = Get-Content $envPath -Raw

    # Update WORDPRESS_TOKEN
    if ($envContent -match 'WORDPRESS_TOKEN=.*') {
        $envContent = $envContent -replace 'WORDPRESS_TOKEN=.*', "WORDPRESS_TOKEN=$($params['access_token'])"
        Write-Host "[OK] Updated WORDPRESS_TOKEN" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] WORDPRESS_TOKEN not found in .env" -ForegroundColor Red
        exit 1
    }

    # Update WORDPRESS_SITE_ID (note: site_id=0 means we still need to fetch it)
    if ($params['site_id'] -ne '0') {
        if ($envContent -match 'WORDPRESS_SITE_ID=.*') {
            $envContent = $envContent -replace 'WORDPRESS_SITE_ID=.*', "WORDPRESS_SITE_ID=$($params['site_id'])"
            Write-Host "[OK] Updated WORDPRESS_SITE_ID to $($params['site_id'])" -ForegroundColor Green
        }
    } else {
        Write-Host "[NOTE] site_id is 0, will fetch actual site ID from API" -ForegroundColor Yellow
    }

    Set-Content -Path $envPath -Value $envContent -NoNewline
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "[SUCCESS] .env file updated with new token!" -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host ""

    if ($params['site_id'] -eq '0') {
        Write-Host "Next step: Run .\get-wordpress-siteid.ps1 to fetch your actual Site ID" -ForegroundColor Cyan
    }

} else {
    Write-Host "[ERROR] Could not parse callback URL" -ForegroundColor Red
    exit 1
}
