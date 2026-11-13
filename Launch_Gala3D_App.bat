@echo off
title Gala3D - 3D Event Design & Floor Planner
cd /d "%~dp0"

echo ===================================================
echo           Starting Gala3D Desktop App
echo ===================================================
echo.
echo Launching Gala3D standalone window...

npx electron electron-main.cjs

if %errorlevel% neq 0 (
    echo.
    echo Electron launch exited, opening Gala3D in default browser...
    start dist\index.html
)

