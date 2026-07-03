@echo off
REM Starts the local MongoDB 8.0 (portable) used by Jewelly.
REM Data is stored in C:\Users\Admin\mongodb-data. Leave this window open while developing.
echo Starting MongoDB 8.0 on mongodb://127.0.0.1:27017 ...
"C:\Users\Admin\mongodb80\mongodb-win32-x86_64-windows-8.0.23\bin\mongod.exe" --dbpath "C:\Users\Admin\mongodb-data" --port 27017 --bind_ip 127.0.0.1
