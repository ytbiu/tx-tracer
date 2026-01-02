#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}      Starting Transaction Tracer       ${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to kill processes on exit
cleanup() {
    echo -e "\n${BLUE}Stopping services...${NC}"
    if [ -n "$BACKEND_PID" ]; then
        echo "Stopping Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ -n "$FRONTEND_PID" ]; then
        echo "Stopping Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo -e "${GREEN}Shutdown complete.${NC}"
    exit
}

# Trap signals
trap cleanup SIGINT SIGTERM EXIT

# 1. Start Backend
echo -e "\n${GREEN}[1/2] Starting Backend Service...${NC}"
cd "$SCRIPT_DIR/tracer-backend"

if [ ! -f "go.mod" ]; then
    echo -e "${RED}Error: tracer-backend/go.mod not found.${NC}"
    exit 1
fi

# Run backend in background
go run main.go &
BACKEND_PID=$!
echo "Backend running with PID: $BACKEND_PID"

# 2. Start Frontend
echo -e "\n${GREEN}[2/2] Starting Frontend Service...${NC}"
cd "$SCRIPT_DIR/tracer-frontend"

if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: tracer-frontend/package.json not found.${NC}"
    cleanup # Kill backend if frontend fails
    exit 1
fi

# Check for node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}node_modules not found. Installing dependencies...${NC}"
    npm install
fi

# Run frontend in background
npm run dev &
FRONTEND_PID=$!
echo "Frontend running with PID: $FRONTEND_PID"

# 3. Wait
echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}All services are up!${NC}"
echo -e "Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "Backend:  ${BLUE}http://localhost:8080${NC}"
echo -e "${BLUE}========================================${NC}"
echo "Press Ctrl+C to stop all services."

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
