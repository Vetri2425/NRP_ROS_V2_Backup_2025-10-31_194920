# PowerShell script to push backup to GitHub
# Run this script after creating the repository on GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Repository Push Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$repoName = "NRP_ROS_V2_Backup_2025-10-31_194920"
$username = "Vetri2425"

Write-Host "Repository Name: $repoName" -ForegroundColor Yellow
Write-Host "GitHub Username: $username" -ForegroundColor Yellow
Write-Host ""

Write-Host "STEP 1: Create the repository on GitHub" -ForegroundColor Green
Write-Host "  1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "  2. Repository name: $repoName" -ForegroundColor White
Write-Host "  3. Description: Backup of NRP ROS V2 Frontend Project - Created on 2025-10-31" -ForegroundColor White
Write-Host "  4. Choose Private or Public" -ForegroundColor White
Write-Host "  5. DO NOT initialize with README, .gitignore, or license" -ForegroundColor Red
Write-Host "  6. Click 'Create repository'" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Have you created the repository on GitHub? (y/n)"

if ($continue -ne "y") {
    Write-Host "Please create the repository first, then run this script again." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "STEP 2: Adding remote and pushing..." -ForegroundColor Green

# Add remote
Write-Host "Adding GitHub remote..." -ForegroundColor Cyan
git remote add origin "https://github.com/$username/$repoName.git"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Remote might already exist. Removing and re-adding..." -ForegroundColor Yellow
    git remote remove origin
    git remote add origin "https://github.com/$username/$repoName.git"
}

# Rename branch to main
Write-Host "Renaming branch to main..." -ForegroundColor Cyan
git branch -M main

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "You may be prompted for GitHub credentials." -ForegroundColor Yellow
Write-Host "Use your Personal Access Token as password (not your GitHub password)" -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ SUCCESS! Repository pushed to GitHub" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "View your repository at:" -ForegroundColor Cyan
    Write-Host "https://github.com/$username/$repoName" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ Push failed. Check errors above." -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  1. Repository doesn't exist on GitHub" -ForegroundColor White
    Write-Host "  2. Authentication failed - use Personal Access Token" -ForegroundColor White
    Write-Host "  3. Network connection issues" -ForegroundColor White
    Write-Host ""
    Write-Host "Generate Personal Access Token at:" -ForegroundColor Cyan
    Write-Host "https://github.com/settings/tokens" -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Press Enter to exit"
