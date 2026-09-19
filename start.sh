#!/bin/bash
echo "Starting Deep Research Agent Full-Stack Platform..."

# Backend
python -m pip install -r backend/requirements.txt
python backend/run.py &
BACKEND_PID=$!

# Frontend
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
