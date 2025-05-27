@echo off
echo Starting Sales Practice AI Application...
echo.

echo Checking if LM Studio is running...
curl -s http://localhost:1234/health >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: LM Studio server is not running on localhost:1234
    echo Please start LM Studio and load a model before continuing.
    echo.
    pause
)

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend Application...
start "Frontend App" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul 