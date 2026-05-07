@echo off
setlocal
cd /d %~dp0

echo ====================================
echo  Watt-Wise Startup Script
echo ====================================

echo [*] Checking backend dependencies...
cd Project-root\backend
call npm install
if %errorlevel% neq 0 (
    echo [!] npm install failed. Ensure Node.js is installed.
    pause
    exit /b %errorlevel%
)

echo [*] Checking ML Python dependencies (this might take a moment on first run)...
cd ..\ml
call python -m pip install -r requirements.txt --quiet
cd ..\backend

echo [*] Starting backend server in a new window...
:: Use 'start' to run the server in a separate window
start "Watt-Wise Backend" cmd /k "node server.js"

echo [*] Waiting for server to initialize...
:: Using ping as a more compatible wait method than 'timeout'
ping 127.0.0.1 -n 4 > nul

echo [*] Opening landing page...
:: Open the app via the server URL to avoid file:// security issues
start "" "http://localhost:5000"

echo [*] Startup sequence complete.
echo [!] Keep the backend window open while using the application.
echo.
echo Press any key to close this launcher...
pause > nul
