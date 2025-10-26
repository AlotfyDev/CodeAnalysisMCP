@echo off
echo ========================================
echo CodeAnalysisServer Web API Server
echo ========================================
echo.
echo Starting FastAPI Web Server for REST API and WebSocket access...
echo.
echo 🔗 Web API Endpoints:
echo    Dashboard: http://localhost:8000/
echo    API Docs:  http://localhost:8000/docs
echo    Health:    http://localhost:8000/health
echo    Metrics:   http://localhost:8000/metrics
echo.
echo 📊 Analysis Results will also be served via web interface
echo.

REM Check if Python is available
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Python not found! Please install Python 3.8+ to use Web API features.
    echo.
    echo Alternative: Run via Docker (if available)
    pause
    exit /b 1
)

echo 🚀 Starting CodeAnalysisServer Web API...
cd "%~dp0\%~n0\..\Web_API"
python fastapi_server.py

if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Failed to start Web API server.
    echo.
    echo Possible issues:
    echo - Missing Python dependencies (run: pip install fastapi uvicorn pydantic)
    echo - Port 8000 already in use
    echo - Firewall blocking the port
    echo.
    pause
    exit /b 1
)
