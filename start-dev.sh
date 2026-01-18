#!/bin/bash
# Bash script to start both backend and frontend

echo "🚀 Starting cpool.ai development servers..."

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "✗ backend/.env not found. Run setup-local.sh first"
    exit 1
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "✗ frontend/.env.local not found. Run setup-local.sh first"
    exit 1
fi

# Start backend in background
echo ""
echo "🔧 Starting backend server..."
cd backend
go run main.go &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo ""
echo "🎨 Starting frontend server..."
echo "Frontend will open at http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
cd frontend
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID 2>/dev/null" EXIT
