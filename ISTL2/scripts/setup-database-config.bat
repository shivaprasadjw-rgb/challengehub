@echo off
REM =====================================================
REM Database Configuration Setup Script
REM =====================================================
REM This script helps you set up your database configuration

echo.
echo =====================================================
echo Database Configuration Setup
echo =====================================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: Please run this script from the project root directory
    pause
    exit /b 1
)

echo This script will help you create a .env.local file with your database configuration.
echo.

REM Check if .env.local already exists
if exist ".env.local" (
    echo .env.local already exists.
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo Configuration setup cancelled.
        pause
        exit /b 0
    )
)

echo Please provide your database connection details:
echo.

set /p db_host="Database Host (default: localhost): "
if "%db_host%"=="" set "db_host=localhost"

set /p db_port="Database Port (default: 5432): "
if "%db_port%"=="" set "db_port=5432"

set /p db_user="Database Username (default: postgres): "
if "%db_user%"=="" set "db_user=postgres"

set /p db_password="Database Password: "

set /p db_name="Database Name (default: sports_india): "
if "%db_name%"=="" set "db_name=sports_india"

echo.
echo Creating .env.local file...

REM Create .env.local file
echo # Database Configuration > .env.local
echo DATABASE_URL="postgresql://%db_user%:%db_password%@%db_host%:%db_port%/%db_name%" >> .env.local
echo. >> .env.local
echo # NextAuth Configuration >> .env.local
echo NEXTAUTH_SECRET="your-secret-key-here" >> .env.local
echo NEXTAUTH_URL="http://localhost:3000" >> .env.local

echo ✅ .env.local file created successfully!
echo.
echo Configuration:
echo Host: %db_host%
echo Port: %db_port%
echo User: %db_user%
echo Database: %db_name%
echo Password: [HIDDEN]
echo.
echo You can now run the database reset script:
echo scripts\sql-reset-database-enhanced.bat
echo.

pause
