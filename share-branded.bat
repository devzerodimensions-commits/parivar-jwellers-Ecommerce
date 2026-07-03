@echo off
REM ============================================================
REM  Parivar Jewellers - Branded public link (localtunnel)
REM  Serves the store at:  https://parivarjewellers.loca.lt
REM
REM  Requirements:
REM    1. The backend must already be running on port 5000
REM       (run start-all.bat first).
REM    2. localtunnel installed globally:  npm install -g localtunnel
REM
REM  Note: first-time visitors see a one-time localtunnel
REM  "Click to Continue" page, then the store loads normally.
REM ============================================================
title Parivar Jewellers - Public Link
echo.
echo   Starting branded public link...
echo   URL:  https://parivarjewellers.loca.lt
echo.
echo   Keep this window OPEN while sharing the site.
echo   Close it to take the public link offline.
echo.
lt --port 5000 --subdomain parivarjewellers
echo.
echo   Tunnel stopped. Press any key to close.
pause >nul
