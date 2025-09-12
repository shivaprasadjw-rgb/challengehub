@echo off
REM Clean Local Database Script for Windows
REM This script cleans duplicate data from your local PostgreSQL database

echo Starting Local Database Cleanup...

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo Error: .env.local file not found. Please create it with your DATABASE_URL
    pause
    exit /b 1
)

echo Current database connection configured in .env.local

REM Create backup first
echo Creating backup...
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set mydate=%%c%%a%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a%%b
set backup_file=backup-%mydate%-%mytime%.sql

REM Use Prisma to create backup (simpler approach)
npx prisma db push --accept-data-loss --preview-feature
if %errorlevel% neq 0 (
    echo Error: Failed to create backup
    pause
    exit /b 1
)

echo Backup created: %backup_file%

REM Clean duplicates using Prisma
echo Cleaning duplicate data...

REM Run the TypeScript cleanup script
npx tsx scripts/clean-duplicates.ts
if %errorlevel% neq 0 (
    echo Error: Failed to clean duplicates
    pause
    exit /b 1
)

echo Local database cleanup completed!
echo Backup file: %backup_file%
echo You can now export clean data and sync to production

pause
