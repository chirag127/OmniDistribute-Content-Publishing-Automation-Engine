#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Fetches WordPress.com Site ID using OAuth token
.DESCRIPTION
    This script retrieves your WordPress.com Site ID by calling the REST API.
    It reads the token from .env file or accepts it as a parameter.
.PARAMETER Token
    Optional WordPress.com OAuth access token. If not provided, reads from .env file.
.EXAMPLE
    .\get-wordpress-siteid.ps1
    .\get-wordpress-siteid.ps1 -Token "your_token_here"
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Token
)

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "==========================================================="
Write-Host "    WordPress.com Site ID Fetcher"
Write-Host "==========================================================="
Write-Host ""

# Function to read token from .env file
function Get-TokenFromEnv {
    $envPath = Join-Path $PSScriptRoot ".env"

    if (-not (Test-Path $envPath)) {
        Write-Host "ERROR: .env file not found at: $envPath" -ForegroundColor Red
        return $null
    }

    Write-Host "Reading token from .env file..." -ForegroundColor Yellow

    $envContent = Get-Content $envPath -Raw
    if ($envContent -match 'WORDPRESS_TOKEN=(.+?)(\r?\n|$)') {
        $token = $matches[1].Trim()
        if ([string]::IsNullOrWhiteSpace($token)) {
            Write-Host "WORDPRESS_TOKEN is empty in .env file" -ForegroundColor Red
            return $null
        }
        Write-Host "[OK] Token found in .env file" -ForegroundColor Green
        return $token
    } else {
        Write-Host "WORDPRESS_TOKEN not found in .env file" -ForegroundColor Red
        return $null
    }
}

# Get token
if ([string]::IsNullOrWhiteSpace($Token)) {
    $Token = Get-TokenFromEnv
    if (-not $Token) {
        Write-Host ""
        Write-Host "No valid token available. Please either:" -ForegroundColor Red
        Write-Host "  1. Set WORDPRESS_TOKEN in your .env file, or"
        Write-Host "  2. Run: .\get-wordpress-siteid.ps1 -Token 'your_token_here'"
        exit 1
    }
}

# Display token info (masked)
$maskedToken = $Token.Substring(0, [Math]::Min(10, $Token.Length)) + "..." + $Token.Substring([Math]::Max(0, $Token.Length - 5))
Write-Host "Using token: $maskedToken" -ForegroundColor Yellow
Write-Host ""

# API endpoint
$apiUrl = "https://public-api.wordpress.com/rest/v1.1/me/sites"

Write-Host "Calling WordPress.com API..." -ForegroundColor Yellow
Write-Host "Endpoint: $apiUrl"
Write-Host ""

try {
    # Create headers
    $headers = @{
        "Authorization" = "Bearer $Token"
        "Accept" = "application/json"
        "User-Agent" = "Omni-Publisher/1.0"
    }

    # Make API request
    $response = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get -ContentType "application/json"

    # Check if we got sites
    if ($response.sites -and $response.sites.Count -gt 0) {
        Write-Host "[SUCCESS] Found $($response.sites.Count) site(s)" -ForegroundColor Green
        Write-Host ""
        Write-Host "==========================================================="

        foreach ($site in $response.sites) {
            Write-Host "Site Information:" -ForegroundColor Green
            Write-Host "  Site ID:       $($site.ID)" -ForegroundColor Cyan
            Write-Host "  Name:          $($site.name)"
            Write-Host "  URL:           $($site.URL)"
            Write-Host "  Visible:       $($site.visible)"
            Write-Host "  Is Private:    $($site.is_private)"
            Write-Host ""

            # Update .env file
            Write-Host "Updating .env file with Site ID..." -ForegroundColor Yellow
            $envPath = Join-Path $PSScriptRoot ".env"
            $envContent = Get-Content $envPath -Raw

            if ($envContent -match 'WORDPRESS_SITE_ID=.*') {
                $envContent = $envContent -replace 'WORDPRESS_SITE_ID=.*', "WORDPRESS_SITE_ID=$($site.ID)"
                Write-Host "[OK] Updated existing WORDPRESS_SITE_ID" -ForegroundColor Green
            } else {
                # Add it after WORDPRESS_TOKEN line
                $envContent = $envContent -replace '(WORDPRESS_TOKEN=.*)', "`$1`r`nWORDPRESS_SITE_ID=$($site.ID)"
                Write-Host "[OK] Added WORDPRESS_SITE_ID" -ForegroundColor Green
            }

            Set-Content -Path $envPath -Value $envContent -NoNewline
            Write-Host "[OK] .env file updated successfully!" -ForegroundColor Green
            Write-Host ""
        }

        Write-Host "==========================================================="
        Write-Host "[COMPLETE] Your WORDPRESS_SITE_ID has been saved to .env" -ForegroundColor Green

    } else {
        Write-Host "WARNING: No sites found for this account" -ForegroundColor Yellow
        Write-Host "  Please ensure:"
        Write-Host "  1. You have a WordPress.com site (not self-hosted)"
        Write-Host "  2. The token has the correct permissions"
        exit 1
    }

} catch {
    Write-Host "ERROR: Failed to fetch Site ID" -ForegroundColor Red
    Write-Host ""

    $statusCode = $_.Exception.Response.StatusCode.value__

    switch ($statusCode) {
        400 {
            Write-Host "Error 400 - Bad Request" -ForegroundColor Red
            Write-Host "  Possible causes:"
            Write-Host "  1. Token format is invalid"
            Write-Host "  2. Token contains special characters that need escaping"
            Write-Host "  3. Token was not properly generated"
            Write-Host ""
            Write-Host "  Solution: Generate a new token" -ForegroundColor Cyan
            Write-Host "  1. Go to: https://developer.wordpress.com/apps/"
            Write-Host "  2. Select your application (Client ID: 128560)"
            Write-Host "  3. Visit this URL:"
            Write-Host "     https://public-api.wordpress.com/oauth2/authorize?client_id=128560&redirect_uri=http://localhost:3000/callback&response_type=token"
            Write-Host "  4. Copy the access_token from the redirect URL"
        }
        401 {
            Write-Host "Error 401 - Unauthorized" -ForegroundColor Red
            Write-Host "  The token is invalid or expired."
            Write-Host "  Please generate a new token from: https://developer.wordpress.com/apps/"
        }
        403 {
            Write-Host "Error 403 - Forbidden" -ForegroundColor Red
            Write-Host "  The token doesn't have the required permissions."
            Write-Host "  Ensure your app has 'global' scope when authorizing."
        }
        404 {
            Write-Host "Error 404 - Not Found" -ForegroundColor Red
            Write-Host "  The API endpoint doesn't exist or the token is invalid."
        }
        default {
            Write-Host "Error $statusCode" -ForegroundColor Red
            Write-Host "  $($_.Exception.Message)"
        }
    }

    Write-Host ""
    Write-Host "Full error details:" -ForegroundColor Yellow
    Write-Host $_.Exception | Format-List * -Force

    exit 1
}
