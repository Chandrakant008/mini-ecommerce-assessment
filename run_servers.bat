@echo off
echo ====================================================
echo Starting ApexStore Mini E-Commerce Servers...
echo ====================================================

echo [1/2] Launching Django Backend Server (0.0.0.0:8000)...
start "ApexStore Backend (Django)" cmd /k "cd /d %~dp0backend && python manage.py runserver 0.0.0.0:8000"

echo [2/2] Launching Vite Frontend Server (Exposed to Network)...
start "ApexStore Frontend (Vite React)" cmd /k "cd /d %~dp0frontend && npm run dev -- --host"

echo.
echo ====================================================
echo Both servers are starting up!
echo - Frontend: http://localhost:5173/
echo - Backend API: http://127.0.0.1:8000/api/products/
echo - Django Admin: http://127.0.0.1:8000/admin/
echo ====================================================
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak > nul
start http://localhost:5173/
