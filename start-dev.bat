@echo off
setlocal

cd /d "%~dp0"

echo GIRIN local dev server
echo Project: %CD%
echo URL: http://localhost:4321/girin/
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Install Node.js 22.12.0 or later, then try again.
  echo.
  pause
  exit /b 1
)

npm run dev

echo.
echo Dev server stopped.
pause
