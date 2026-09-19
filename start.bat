@echo off
title Deep Research Agent Full-Stack Platform
echo ======================================================
echo    Starting Deep Research Agent Full-Stack Platform
echo ======================================================

echo.
echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "Deep Research Backend" cmd /k "python -m pip install -r backend/requirements.txt && python backend/run.py"

echo.
echo [2/2] Launching React Frontend on http://127.0.0.1:3000 ...
start "Deep Research Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Application starting! Opening dashboard...
timeout /t 4 >nul
start http://127.0.0.1:3000
