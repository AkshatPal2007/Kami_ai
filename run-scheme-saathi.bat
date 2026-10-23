@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 20 or newer from https://nodejs.org/ and try again.
  pause
  exit /b 1
)
echo Starting Scheme Saathi. Keep this window open while using the demo.
node server.js
echo.
echo Scheme Saathi has stopped.
pause
