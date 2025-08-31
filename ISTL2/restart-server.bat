@echo off
echo 🚀 Restarting ISTL2 Server...
echo ================================

echo.
echo 📁 Stopping any running servers...
taskkill /f /im node.exe 2>nul
echo ✅ Servers stopped

echo.
echo 🗑️ Clearing Next.js cache...
if exist ".next" (
    rmdir .next /s /q
    echo ✅ Next.js cache cleared
) else (
    echo ℹ️ No Next.js cache found
)

echo.
echo 🗑️ Clearing Prisma cache...
if exist "node_modules\.prisma" (
    rmdir node_modules\.prisma /s /q
    echo ✅ Prisma cache cleared
) else (
    echo ℹ️ No Prisma cache found
)

echo.
echo 🔄 Starting development server...
echo ⏳ Server will start in a moment...
echo.
echo 🌐 After server starts, test login at:
echo    http://localhost:3001/auth/login
echo.
echo 🔑 Login credentials:
echo    Email: neworganizer@example.com
echo    Password: newpass123
echo.

npm run dev

pause