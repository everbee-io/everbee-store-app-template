#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}🚀 Starting EverBee Store App...${NC}"
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  backend/.env not found. Please run 'npm run setup' first.${NC}"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  frontend/.env not found. Please run 'npm run setup' first.${NC}"
    exit 1
fi

# Kill processes on exit
trap 'kill 0' EXIT

# Start backend
cd backend
echo -e "${GREEN}Starting Backend API on port 3001...${NC}"
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start frontend
cd ../frontend
echo -e "${GREEN}Starting Frontend on port 3000...${NC}"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Both servers are running!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
