@echo off
setlocal enabledelayedexpansion

:: === Configuration ===
set LOGFILE=issues-and-fixes.md

:: === Get today's date ===
for /f "tokens=2 delims==" %%I in ('"wmic os get localdatetime /value"') do set datetime=%%I
set DATE=!datetime:~0,4!-!datetime:~4,2!-!datetime:~6,2!

echo.
echo ===============================
echo Log a New Fix - %DATE%
echo ===============================
set /p ISSUE="Issue: "
set /p CAUSE="Cause: "
set /p FIX="Fix Summary: "
set /p FILES="Files Affected: "
set /p PROMPT="Cursor Prompt Used: "

:: === Append to issues-and-fixes.md ===
echo |%DATE%|%ISSUE%|%CAUSE%|%FIX%|%FILES%|%PROMPT%|>> %LOGFILE%

echo.
echo ✅ Fix logged in %LOGFILE%
pause
