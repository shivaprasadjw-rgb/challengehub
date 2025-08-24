@echo off
REM ISTL2 Website Backup Script for Windows
REM Usage: istl2-backup.bat

set WEBSITE_NAME=ISTL2
set BACKUP_DIR=istl2-backups
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set DATE=%DATE: =0%
set BACKUP_NAME=istl2-backup-%DATE%
set FULL_BACKUP_PATH=%BACKUP_DIR%\%BACKUP_NAME%

echo 🏆 ISTL2 Website Backup Script
echo ===============================
echo Website: %WEBSITE_NAME%
echo Backup: %BACKUP_NAME%
echo Time: %date% %time%
echo.

echo 📁 Creating backup directory...
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
mkdir "%FULL_BACKUP_PATH%"

echo 🚀 Backing up core application...
if exist "app" (
    xcopy "app" "%FULL_BACKUP_PATH%\app\" /E /I /Y
    echo ✅ App Router copied
) else (
    echo ❌ App Router not found
)

if exist "components" (
    xcopy "components" "%FULL_BACKUP_PATH%\components\" /E /I /Y
    echo ✅ Components copied
) else (
    echo ❌ Components not found
)

if exist "lib" (
    xcopy "lib" "%FULL_BACKUP_PATH%\lib\" /E /I /Y
    echo ✅ Libraries copied
) else (
    echo ❌ Libraries not found
)

if exist "public" (
    xcopy "public" "%FULL_BACKUP_PATH%\public\" /E /I /Y
    echo ✅ Public assets copied
) else (
    echo ❌ Public assets not found
)

echo ⚙️  Backing up configuration files...
if exist "package.json" (
    copy "package.json" "%FULL_BACKUP_PATH%\"
    echo ✅ Package.json copied
)

if exist "package-lock.json" (
    copy "package-lock.json" "%FULL_BACKUP_PATH%\"
    echo ✅ Package-lock.json copied
)

if exist "tsconfig.json" (
    copy "tsconfig.json" "%FULL_BACKUP_PATH%\"
    echo ✅ TypeScript config copied
)

if exist "next.config.js" (
    copy "next.config.js" "%FULL_BACKUP_PATH%\"
    echo ✅ Next.js config copied
)

if exist "tailwind.config.js" (
    copy "tailwind.config.js" "%FULL_BACKUP_PATH%\"
    echo ✅ Tailwind config copied
)

if exist "postcss.config.js" (
    copy "postcss.config.js" "%FULL_BACKUP_PATH%\"
    echo ✅ PostCSS config copied
)

if exist "next-env.d.ts" (
    copy "next-env.d.ts" "%FULL_BACKUP_PATH%\"
    echo ✅ Next.js TypeScript definitions copied
)

if exist "middleware.ts" (
    copy "middleware.ts" "%FULL_BACKUP_PATH%\"
    echo ✅ Next.js middleware copied
)

echo 💾 Backing up data files...
if exist "data" (
    xcopy "data" "%FULL_BACKUP_PATH%\data\" /E /I /Y
    echo ✅ Data files copied
)

echo 📚 Backing up documentation...
if exist "README.md" (
    copy "README.md" "%FULL_BACKUP_PATH%\"
    echo ✅ README copied
)

if exist "SECURITY.md" (
    copy "SECURITY.md" "%FULL_BACKUP_PATH%\"
    echo ✅ Security docs copied
)

if exist ".gitignore" (
    copy ".gitignore" "%FULL_BACKUP_PATH%\"
    echo ✅ Git ignore rules copied
)

echo 📝 Creating backup information...
echo ISTL2 Website Backup Information > "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo ================================ >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo. >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo Backup Date: %date% >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo Backup Time: %time% >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo Website Name: %WEBSITE_NAME% >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo Backup Version: %BACKUP_NAME% >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo. >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo Contents: >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo - App Router pages and API routes >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo - React components >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo - Utility libraries and business logic >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo - Public assets >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo - Configuration files >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo - Application data >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo - Documentation >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo. >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo Backup created by: %USERNAME% >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"
echo System: Windows >> "%FULL_BACKUP_PATH%\BACKUP_INFO.txt"

echo ✅ Backup information file created

echo 🗜️  Creating compressed archive...
cd "%BACKUP_DIR%"
powershell Compress-Archive -Path "%BACKUP_NAME%" -DestinationPath "%BACKUP_NAME%.zip" -Force

echo 🧹 Cleaning up temporary files...
rmdir /S /Q "%BACKUP_NAME%"

cd ..

echo.
echo 🎉 ISTL2 Website Backup Completed Successfully!
echo ================================================
echo Backup Location: %BACKUP_DIR%\%BACKUP_NAME%.zip
echo Created At: %date% %time%
echo Website: %WEBSITE_NAME%
echo.

echo 📋 Backup Contents Summary:
echo ├── App Router (pages, API routes)
echo ├── React Components
echo ├── Utility Libraries
echo ├── Public Assets
echo ├── Configuration Files
echo ├── Application Data
echo ├── Documentation
echo └── Backup Information
echo.

echo 📖 To restore from this backup:
echo 1. Extract: Right-click %BACKUP_NAME%.zip and "Extract All"
echo 2. Navigate to the extracted folder
echo 3. Install: npm install
echo 4. Run: npm run dev
echo.

echo Your ISTL2 website is now safely backed up!
echo 💡 Run this script again whenever you want to create a new backup.
echo.
pause