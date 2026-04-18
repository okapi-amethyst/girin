@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "WATCH_DIR=%SCRIPT_DIR%watch"

if not exist "%WATCH_DIR%" (
  mkdir "%WATCH_DIR%"
)

python "%SCRIPT_DIR%combo_trim.py" "%WATCH_DIR%"

echo.
pause
