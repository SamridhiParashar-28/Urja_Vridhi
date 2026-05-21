@echo off
setlocal
cd /d "%~dp0"

echo ====================================
echo  Watt-Wise Startup Script
echo ====================================

echo [*] Checking Arduino connection...
set ESP_IP=10.205.143.142
ping -n 1 -w 1000 %ESP_IP% > nul
if %errorlevel% equ 0 (
    echo [+] Arduino detected at %ESP_IP%
    echo [*] Starting Hardware Monitor...
    start "Hardware Monitor" cmd /c "cd Project-root && python hardware_monitor.py"
) else (
    echo [-] Arduino NOT detected at %ESP_IP%. Hardware Monitor will not auto-start.
    echo [-] Please check power and Wi-Fi if you intend to use live hardware.
)

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
