@echo off
title Parivar Jewellers - Share Online (public link)
set "PATH=C:\Program Files\nodejs;%PATH%"

echo ==================================================
echo   Parivar Jewellers - create a PUBLIC link
echo ==================================================
echo.

echo [1/4] Starting MongoDB...
start "MongoDB" "C:\Users\Admin\mongodb80\mongodb-win32-x86_64-windows-8.0.23\bin\mongod.exe" --dbpath "C:\Users\Admin\mongodb-data" --port 27017 --bind_ip 127.0.0.1
timeout /t 6 /nobreak >nul

echo [2/4] Building the latest site...
cd /d C:\Users\Admin\Desktop\jewelly-code\frontend
call npm run build

echo [3/4] Starting the server (site + API on port 5000)...
start "Jewelly Server" cmd /k "cd /d C:\Users\Admin\Desktop\jewelly-code\backend && set NODE_ENV=production&& npm start"
timeout /t 6 /nobreak >nul

echo [4/4] Creating your public link...
echo.
echo   Look for a line like:  https://SOMETHING.trycloudflare.com
echo   Copy that URL and share it. Keep ALL windows open while sharing.
echo   (The link changes every time you run this.)
echo.
"C:\Users\Admin\cloudflared\cloudflared.exe" tunnel --url http://localhost:5000 --no-autoupdate
pause
