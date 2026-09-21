@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo       Workday Journey V5
echo       Smart Journey ^& PWA
echo ============================================
echo.

if not exist "%~dp0assets\fonts\Sarabun-Regular.ttf" (
  echo Sarabun local font has not been downloaded yet.
  echo Internet is needed once; after that the font works offline.
  echo.
  choice /C YN /N /M "Download Sarabun now? [Y/N] "
  if errorlevel 2 goto open_dashboard
  call "%~dp0setup-sarabun-font.bat"
)

:open_dashboard
echo.
echo Opening dashboard in your default browser...
echo No XAMPP / Node.js / npm / database required.
start "" "%~dp0index.html"
timeout /t 2 /nobreak >nul
endlocal
