@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo        Sarabun Local Font Setup
echo ============================================
echo.
echo This downloads Sarabun from the official
echo Google Fonts repository into assets\fonts.
echo Internet is required only for this setup.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-sarabun-font.ps1"
if errorlevel 1 (
  echo.
  echo Font setup failed. Please check your internet connection.
  echo The dashboard will still work with fallback fonts.
  echo.
  pause
  exit /b 1
)

echo Press any key to close...
pause >nul
endlocal
