@echo off
:: === GitHub Upload Script ===
:: This script will upload "vercel-ready-with-setup.zip" 
:: to your GitHub repo: https://github.com/shivaprasadjw-rgb/vercel-ready-with-setup.git

set ZIPFILE=vercel-ready-with-setup.zip
set REPOURL=https://github.com/shivaprasadjw-rgb/vercel-ready-with-setup.git
set PROJECTFOLDER=vercel-ready-with-setup

:: Unzip file
echo 🔄 Extracting %ZIPFILE%...
powershell -command "Expand-Archive -Force '%ZIPFILE%' '%PROJECTFOLDER%'"

:: Go to project folder
cd %PROJECTFOLDER%

:: Remove old .git if exists
if exist ".git" (
  echo ⚠️ Removing old .git folder...
  rmdir /s /q .git
)

:: Initialize Git
echo 🔄 Initializing Git...
git init
git branch -M main
git add .
git commit -m "Initial commit from zip"

:: Add remote (overwrite if exists)
git remote remove origin 2>nul
git remote add origin %REPOURL%

:: Push
git push -u origin main --force

echo ✅ Upload complete!
pause
