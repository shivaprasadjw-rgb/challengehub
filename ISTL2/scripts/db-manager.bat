@echo off
REM Database Management Script for Windows
REM This script provides a menu-driven interface for all database operations

echo.
echo Database Management Script
echo ================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: Please run this script from the project root directory
    pause
    exit /b 1
)

:menu
echo.
echo Select an operation:
echo 1. Clean Local Database (remove duplicates)
echo 2. Reset Local Database (complete reset + seed)
echo 3. Export Clean Data from Local
echo 4. Clean Production Database (remove duplicates)
echo 5. Reset Production Database (complete reset)
echo 6. Import Clean Data to Production
echo 7. Show Database Status
echo 8. Exit
echo.

set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" (
    echo Cleaning Local Database...
    call scripts\clean-local-db.bat
    goto continue
)

if "%choice%"=="2" (
    echo Resetting Local Database...
    call scripts\reset-local-db.bat
    goto continue
)

if "%choice%"=="3" (
    echo Exporting Clean Data from Local...
    call scripts\export-clean-data.bat
    goto continue
)

if "%choice%"=="4" (
    echo Cleaning Production Database...
    call scripts\clean-production-db.bat
    goto continue
)

if "%choice%"=="5" (
    echo Resetting Production Database...
    call scripts\reset-production-db.bat
    goto continue
)

if "%choice%"=="6" (
    echo Importing Clean Data to Production...
    call scripts\import-clean-data.bat
    goto continue
)

if "%choice%"=="7" (
    echo Showing Database Status...
    call scripts\show-db-status.bat
    goto continue
)

if "%choice%"=="8" (
    echo Goodbye!
    exit /b 0
)

echo Invalid option. Please try again.
goto continue

:continue
echo.
pause
goto menu
