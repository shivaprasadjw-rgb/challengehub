@echo off
REM =====================================================
REM Enhanced Database Reset Script for Windows
REM =====================================================
REM This script automatically parses DATABASE_URL and resets your database
REM ⚠️ WARNING: This will DELETE ALL DATA

echo.
echo =====================================================
echo Enhanced Database Reset Script for Windows
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
REM 1. LOAD DATABASE CONFIGURATION
REM =====================================================
set DB_HOST=
set DB_PORT=
set DB_USER=
set DB_NAME=
set DB_PASSWORD=

REM Try to load from .env.local first
if exist ".env.local" (
    echo Loading database configuration from .env.local...
    for /f "usebackq tokens=1,2 delims==" %%a in (".env.local") do (
        if "%%a"=="DATABASE_URL" (
            call :ParseDatabaseURL "%%b"
        )
    )
) else (
    echo .env.local not found. Using default configuration...
    echo Please create .env.local with your DATABASE_URL
    echo Example: DATABASE_URL="postgresql://user:pass@host:port/db"
    echo.
    set DB_HOST=localhost
    set DB_PORT=5432
    set DB_USER=postgres
    set DB_NAME=sports_india
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

if "%DB_HOST%"=="" (
    echo Error: Database configuration not found
    echo Please create .env.local with DATABASE_URL
    pause
    exit /b 1
)

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
REM 3. CREATE BACKUP WITH ACTUAL VALUES
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
echo Command: pg_dump -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% ^> %backup_file%

REM Create backup using pg_dump with actual values
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
    echo Make sure PostgreSQL client tools are installed
    pause
    exit /b 1
)

echo ✅ Backup created successfully: %backup_file%

REM =====================================================
REM 4. EXECUTE RESET USING SQL SCRIPT
REM =====================================================
echo.
echo =====================================================
echo Executing database reset...
echo =====================================================

echo Running SQL reset script: scripts\sql-reset-database.sql

if "%DB_PASSWORD%"=="" (
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f scripts\sql-reset-database.sql
) else (
    set PGPASSWORD=%DB_PASSWORD%
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f scripts\sql-reset-database.sql
)

if %errorlevel% neq 0 (
    echo Error: Failed to execute reset script
    echo Please check your database connection and SQL script
    pause
    exit /b 1
)

echo ✅ Database reset completed successfully

REM =====================================================
REM 5. NEXT STEPS
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
goto :eof

REM =====================================================
REM FUNCTION: Parse Database URL
REM =====================================================
:ParseDatabaseURL
set "url=%~1"
REM Remove quotes if present
set "url=%url:"=%"

REM Parse postgresql://user:pass@host:port/database
REM Extract user:pass@host:port/database part
for /f "tokens=3 delims=/" %%a in ("%url%") do set "rest=%%a"

REM Extract user:pass@host:port part
for /f "tokens=1 delims=/" %%a in ("%rest%") do set "userpasshostport=%%a"

REM Extract host:port part
for /f "tokens=2 delims=@" %%a in ("%userpasshostport%") do set "hostport=%%a"

REM Extract user:pass part
for /f "tokens=1 delims=@" %%a in ("%userpasshostport%") do set "userpass=%%a"

REM Extract user and password
for /f "tokens=1,2 delims=:" %%a in ("%userpass%") do (
    set "DB_USER=%%a"
    set "DB_PASSWORD=%%b"
)

REM Extract host and port
for /f "tokens=1,2 delims=:" %%a in ("%hostport%") do (
    set "DB_HOST=%%a"
    set "DB_PORT=%%b"
)

REM Extract database name
for /f "tokens=2 delims=/" %%a in ("%rest%") do set "DB_NAME=%%a"

REM Set defaults if not found
if "%DB_PORT%"=="" set "DB_PORT=5432"

echo Parsed configuration:
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo User: %DB_USER%
echo Database: %DB_NAME%
echo Password: [HIDDEN]

goto :eof
