@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo   Workday Progress Dashboard V4 - PWA Mode
echo ============================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found.
  echo You can still open index.html normally, or deploy this folder to Vercel.
  pause
  exit /b 1
)

start "Workday Progress V4 Server" cmd /k "node local-server.js"
timeout /t 2 /nobreak >nul
start "" "http://localhost:4173"
endlocal
