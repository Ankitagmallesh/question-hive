#!/bin/bash

# Question Hive Auto Setup and Start Script with Error Recovery
set -e

echo "🚀 Starting Question Hive Application..."

# Load environment variables from .env.local files if present
load_env() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "🔐 Loading env from $file"
        set -a
        # shellcheck disable=SC1090
        source "$file"
        set +a
    fi
}

# Root and app-specific envs
load_env ".env.local"
load_env "apps/server/.env.local"
load_env "apps/web/.env.local"

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    echo "🔄 Cleaning port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 1
}

# Kill existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "next-server" 2>/dev/null || true
pkill -f "go run main.go" 2>/dev/null || true
kill_port 8080
kill_port 3000

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=100
    local attempt=1
    
    echo "⏳ Waiting for $service_name to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s $url > /dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to start"
    return 1
}

echo "�️ Supabase-only mode: Local Postgres via Docker is disabled."

# Start backend with health check
echo "🔧 Starting backend server..."
cd apps/server
go run main.go &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID)"
cd ../..

# Wait for backend to be ready
if ! wait_for_service "http://localhost:8080/health" "Backend API"; then
    echo "❌ Backend failed to start properly"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Start frontend with health check
echo "🌐 Starting frontend server..."
cd apps/web
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID)"
cd ../..

# Wait for frontend to be ready
if ! wait_for_service "http://localhost:3000" "Frontend"; then
    echo "❌ Frontend failed to start properly"
    kill $FRONTEND_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo "🎉 Question Hive is now running!"
echo "📊 Backend API: http://localhost:8080"
echo "🌐 Frontend: http://localhost:3000"
echo "🗄️  Database: Supabase Postgres (DATABASE_URL)"
echo ""
echo "Press Ctrl+C to stop all services"

# Cleanup function
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    
    # Kill backend and frontend
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    
    # Clean up any remaining processes on our ports
    kill_port 8080
    kill_port 3000
    
    echo "✅ All services stopped cleanly"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Simple wait for user interrupt
while true; do
    sleep 1
done