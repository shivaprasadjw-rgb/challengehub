@echo off
REM =====================================================
REM Complete Database Reset Script for Windows
REM =====================================================
REM This script completely resets your PostgreSQL database
REM ⚠️ WARNING: This will DELETE ALL DATA
REM ⚠️ Make sure you have a backup before running this!

echo.
echo =====================================================
echo Complete Database Reset Script for Windows
echo =====================================================
echo ⚠️  WARNING: This will DELETE ALL DATA
echo ⚠️  Make sure you have a backup before running this!
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM =====================================================
REM 1. DATABASE CONFIGURATION
REM =====================================================
REM Set your database connection details here
REM Modify these values according to your setup

set DB_HOST=localhost
set DB_PORT=5432
set DB_USER=postgres
set DB_NAME=sports_india
set DB_PASSWORD=

REM Alternative: Load from environment file if it exists
if exist ".env.local" (
    echo Loading database configuration from .env.local...
    for /f "tokens=1,2 delims==" %%a in (.env.local) do (
        if "%%a"=="DATABASE_URL" (
            REM Parse DATABASE_URL: postgresql://user:pass@host:port/database
            set DB_URL=%%b
            REM Extract components (simplified parsing)
            echo Database URL found: %%b
        )
    )
)

REM =====================================================
REM 2. SAFETY CONFIRMATION
REM =====================================================
echo Current database configuration:
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo User: %DB_USER%
echo Database: %DB_NAME%
echo.

echo ⚠️  WARNING: This will DELETE ALL DATA from the database!
echo Target database: %DB_NAME% on %DB_HOST%:%DB_PORT%
echo.

set /p confirm1="Type 'DELETE ALL DATA' to confirm: "
if not "%confirm1%"=="DELETE ALL DATA" (
    echo Operation cancelled - confirmation text did not match
    pause
    exit /b 1
)

set /p confirm2="Are you absolutely sure? Type 'YES' to proceed: "
if not "%confirm2%"=="YES" (
    echo Operation cancelled
    pause
    exit /b 1
)

REM =====================================================
REM 3. CREATE BACKUP
REM =====================================================
echo.
echo =====================================================
echo Creating comprehensive backup...
echo =====================================================

REM Generate timestamp for backup filename
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set mydate=%%c%%a%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a%%b
set backup_file=full_backup_%mydate%_%mytime%.sql

echo Creating backup: %backup_file%

REM Create backup using pg_dump
if "%DB_PASSWORD%"=="" (
    echo Please enter your database password when prompted:
    pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% > %backup_file%
) else (
    set PGPASSWORD=%DB_PASSWORD%
    pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% > %backup_file%
)

if %errorlevel% neq 0 (
    echo Error: Failed to create backup
    echo Please check your database connection details
    pause
    exit /b 1
)

echo ✅ Backup created successfully: %backup_file%

REM =====================================================
REM 4. CHECK CURRENT DATA COUNTS
REM =====================================================
echo.
echo =====================================================
echo Checking current data counts...
echo =====================================================

REM Create temporary SQL file for data count check
echo SELECT 'Tournaments' as table_name, COUNT(*) as count FROM tournaments UNION ALL SELECT 'Organizers', COUNT(*) FROM organizers UNION ALL SELECT 'Venues', COUNT(*) FROM venues UNION ALL SELECT 'Registrations', COUNT(*) FROM registrations UNION ALL SELECT 'Judges', COUNT(*) FROM judges UNION ALL SELECT 'Payments', COUNT(*) FROM payments UNION ALL SELECT 'Users', COUNT(*) FROM users UNION ALL SELECT 'Audit Logs', COUNT(*) FROM audit_logs ORDER BY table_name; > temp_count_check.sql

if "%DB_PASSWORD%"=="" (
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f temp_count_check.sql
) else (
    set PGPASSWORD=%DB_PASSWORD%
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f temp_count_check.sql
)

del temp_count_check.sql

REM =====================================================
REM 5. DELETE ALL DATA
REM =====================================================
echo.
echo =====================================================
echo Deleting all data (except users)...
echo =====================================================

REM Create temporary SQL file for data deletion
echo -- Delete in order to respect foreign key constraints > temp_delete_data.sql
echo DELETE FROM registrations; >> temp_delete_data.sql
echo DELETE FROM tournaments; >> temp_delete_data.sql
echo DELETE FROM venues; >> temp_delete_data.sql
echo DELETE FROM judges; >> temp_delete_data.sql
echo DELETE FROM payments; >> temp_delete_data.sql
echo DELETE FROM audit_logs; >> temp_delete_data.sql
echo DELETE FROM organizer_applications; >> temp_delete_data.sql
echo DELETE FROM user_organizers; >> temp_delete_data.sql
echo -- Keep users for authentication >> temp_delete_data.sql
echo -- DELETE FROM users; >> temp_delete_data.sql

if "%DB_PASSWORD%"=="" (
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f temp_delete_data.sql
) else (
    set PGPASSWORD=%DB_PASSWORD%
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f temp_delete_data.sql
)

if %errorlevel% neq 0 (
    echo Error: Failed to delete data
    del temp_delete_data.sql
    pause
    exit /b 1
)

del temp_delete_data.sql

echo ✅ All data deleted successfully

REM =====================================================
REM 6. VERIFY RESET
REM =====================================================
echo.
echo =====================================================
echo Verifying reset...
echo =====================================================

REM Create temporary SQL file for verification
echo SELECT 'Tournaments' as table_name, COUNT(*) as count FROM tournaments UNION ALL SELECT 'Organizers', COUNT(*) FROM organizers UNION ALL SELECT 'Venues', COUNT(*) FROM venues UNION ALL SELECT 'Registrations', COUNT(*) FROM registrations UNION ALL SELECT 'Judges', COUNT(*) FROM judges UNION ALL SELECT 'Payments', COUNT(*) FROM payments UNION ALL SELECT 'Users', COUNT(*) FROM users UNION ALL SELECT 'Audit Logs', COUNT(*) FROM audit_logs ORDER BY table_name; > temp_verify_reset.sql

if "%DB_PASSWORD%"=="" (
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f temp_verify_reset.sql
) else (
    set PGPASSWORD=%DB_PASSWORD%
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f temp_verify_reset.sql
)

del temp_verify_reset.sql

REM =====================================================
REM 7. NEXT STEPS
REM =====================================================
echo.
echo =====================================================
echo Reset completed successfully!
echo =====================================================
echo.
echo 📁 Backup file: %backup_file%
echo 🎯 Database is now empty and ready for clean data
echo.
echo Next steps:
echo 1. Run your Prisma seed script: npm run db:seed
echo 2. Or import clean data from your export files
echo 3. Test your application to ensure everything works
echo.
echo ⚠️  Keep the backup file safe in case you need to restore data
echo.

pause
