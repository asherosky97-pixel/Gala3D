@echo off
title Gala3D Web Server
cd /d "%~dp0"

echo ===================================================
echo           Starting Gala3D Web Server
echo ===================================================
echo.
echo Gala3D will open in your default browser at http://localhost:3000
echo You can use it offline on this laptop or connect from other devices!
echo.

start "" "http://localhost:3000"
npx vite preview --port 3000 --host

