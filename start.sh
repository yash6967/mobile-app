#!/bin/bash

echo "Starting Sales Practice AI Application..."
echo

# Check if LM Studio is running
echo "Checking if LM Studio is running..."
if ! curl -s http://localhost:1234/health > /dev/null 2>&1; then
    echo "WARNING: LM Studio server is not running on localhost:1234"
    echo "Please start LM Studio and load a model before continuing."
    echo
    read -p "Press Enter to continue anyway or Ctrl+C to exit..."
fi

echo "Starting Backend Server..."
cd backend
npm start &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

echo "Starting Frontend Application..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for user to stop
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 