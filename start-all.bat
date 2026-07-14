@echo off
title Parivar Jewellers - Launcher
set "PATH=C:\Program Files\nodejs;%PATH%"

echo ============================================
echo   Starting Parivar Jewellers (all servers)
echo ============================================
echo.

echo [1/3] Starting MongoDB (database)...
start "MongoDB" "C:\Users\Admin\mongodb80\mongodb-win32-x86_64-windows-8.0.23\bin\mongod.exe" --dbpath "C:\Users\Admin\mongodb-data" --port 27017 --bind_ip 127.0.0.1
timeout /t 6 /nobreak >nul

echo [2/3] Starting Backend API (port 5000)...
start "Parivar Backend" /D "%~dp0backend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo [3/3] Starting Frontend (port 5173)...
start "Parivar Frontend" /D "%~dp0frontend" cmd /k "npm run dev"
timeout /t 9 /nobreak >nul

echo.
echo Opening the website in your browser...
start "" "http://localhost:5173/"

echo.
echo ============================================
echo   All servers launched in separate windows.
echo   KEEP those windows open while using the site.
echo   Close them to stop the site.
echo ============================================
echo.
pause
