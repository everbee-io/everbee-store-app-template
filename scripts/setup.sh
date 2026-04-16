#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BLUE}${BOLD}============================================${NC}"
echo -e "${BLUE}${BOLD}   EverBee Store App Template - Setup${NC}"
echo -e "${BLUE}${BOLD}============================================${NC}"
echo ""

# ── Check prerequisites ──────────────────────────────────────────────

echo -e "${BOLD}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is required but not installed.${NC}"
    echo "Install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js 18+ is required. You have $(node -v).${NC}"
    echo "Update Node.js from https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}Node.js $(node -v) found${NC}"
echo ""

# ── Step 1: App Name ─────────────────────────────────────────────────

echo -e "${BOLD}Step 1/4: App Name${NC}"
echo "This will be displayed in the UI and used in configuration."
echo ""
read -p "  What would you like to name your app? [My EverBee App]: " APP_NAME
APP_NAME=${APP_NAME:-"My EverBee App"}
echo ""

# ── Step 2: MongoDB Atlas ────────────────────────────────────────────

echo -e "${BOLD}Step 2/4: MongoDB Atlas${NC}"
echo ""
echo "  You need a free MongoDB Atlas cluster for your database."
echo "  If you don't have one yet:"
echo ""
echo "    1. Go to ${BLUE}https://www.mongodb.com/atlas${NC}"
echo "    2. Create a free account and a free M0 cluster"
echo "    3. Create a database user (username + password)"
echo "    4. Add 0.0.0.0/0 to Network Access (allows all IPs)"
echo "    5. Click 'Connect' > 'Drivers' > copy the connection string"
echo "       It looks like: mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/"
echo ""

while true; do
    read -p "  Paste your MongoDB connection string: " MONGODB_URI

    if [ -z "$MONGODB_URI" ]; then
        echo -e "  ${RED}Connection string cannot be empty.${NC}"
        continue
    fi

    if [[ "$MONGODB_URI" == mongodb+srv://* ]] || [[ "$MONGODB_URI" == mongodb://* ]]; then
        break
    else
        echo -e "  ${RED}Must start with mongodb+srv:// or mongodb://${NC}"
        echo "  Example: mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/"
    fi
done

# Append database name if not present
if [[ "$MONGODB_URI" != *"/"*"."*"/"* ]] && [[ "$MONGODB_URI" != *"/everbee"* ]]; then
    MONGODB_URI="${MONGODB_URI%/}/everbee_store_app"
fi

echo ""

# ── Step 3: EverBee Credentials ──────────────────────────────────────

echo -e "${BOLD}Step 3/4: EverBee Store Credentials${NC}"
echo ""
echo "  Get your app credentials from the EverBee developer dashboard:"
echo "    ${BLUE}https://store.everbee.io/admin/apps${NC}"
echo ""
echo "  Create a new app if you haven't already."
echo ""

while true; do
    read -p "  EverBee Client ID: " EVERBEE_CLIENT_ID
    if [ -n "$EVERBEE_CLIENT_ID" ]; then break; fi
    echo -e "  ${RED}Client ID is required.${NC}"
done

while true; do
    read -p "  EverBee Client Secret: " EVERBEE_CLIENT_SECRET
    if [ -n "$EVERBEE_CLIENT_SECRET" ]; then break; fi
    echo -e "  ${RED}Client Secret is required.${NC}"
done

echo ""

# ── Step 4: Generate secrets & write config ──────────────────────────

echo -e "${BOLD}Step 4/4: Configuring project...${NC}"
echo ""

JWT_SECRET=$(openssl rand -base64 32)

# Write backend/.env
cat > backend/.env << EOF
# Database (MongoDB Atlas)
MONGODB_URI=${MONGODB_URI}

# EverBee Store OAuth
EVERBEE_CLIENT_ID=${EVERBEE_CLIENT_ID}
EVERBEE_CLIENT_SECRET=${EVERBEE_CLIENT_SECRET}
EVERBEE_REDIRECT_URI=http://localhost:3001/api/auth/callback
EVERBEE_AUTH_URL=https://auth.everbee.com/oauth

# JWT Secret (auto-generated)
JWT_SECRET=${JWT_SECRET}

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF

echo -e "  ${GREEN}Created backend/.env${NC}"

# Write frontend/.env
cat > frontend/.env << EOF
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=${APP_NAME}
EOF

echo -e "  ${GREEN}Created frontend/.env${NC}"

# Generate app config
mkdir -p frontend/src/config
cat > frontend/src/config/app.ts << EOF
export const appConfig = {
  name: '${APP_NAME}',
  description: 'Manage your EverBee Store with AI',
  logo: '/logo.png',
  theme: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
  },
  features: {
    products: true,
    orders: true,
    analytics: true,
    collections: true,
    customers: true,
  }
}
EOF

echo -e "  ${GREEN}Created app configuration${NC}"
echo ""

# ── Install dependencies ─────────────────────────────────────────────

echo -e "${BOLD}Installing dependencies...${NC}"
echo ""

echo "  Installing backend dependencies..."
cd backend
npm install --silent 2>/dev/null || npm install
echo -e "  ${GREEN}Backend dependencies installed${NC}"

echo "  Installing frontend dependencies..."
cd ../frontend
npm install --silent 2>/dev/null || npm install
echo -e "  ${GREEN}Frontend dependencies installed${NC}"

cd ..
echo ""

# ── Seed database ────────────────────────────────────────────────────

echo "Seeding demo data..."
cd backend
npx tsx seed/seed.ts
cd ..
echo -e "${GREEN}Database seeded with demo data${NC}"
echo ""

# ── Done ─────────────────────────────────────────────────────────────

echo -e "${GREEN}${BOLD}============================================${NC}"
echo -e "${GREEN}${BOLD}   ${APP_NAME} is ready!${NC}"
echo -e "${GREEN}${BOLD}============================================${NC}"
echo ""
echo -e "  ${BOLD}Start developing:${NC}"
echo "    npm run dev"
echo ""
echo -e "  ${BOLD}Then open:${NC}"
echo "    http://localhost:3000"
echo ""
echo -e "  ${BOLD}Demo credentials:${NC}"
echo "    Email:    demo@example.com"
echo "    Password: password"
echo ""
echo -e "  ${BOLD}Build your app:${NC}"
echo "    Open in Cursor and start prompting!"
echo "    See BUILD_WITH_AI.md for ideas."
echo ""
echo -e "  ${BOLD}When you're ready to deploy:${NC}"
echo "    npm run deploy"
echo ""
