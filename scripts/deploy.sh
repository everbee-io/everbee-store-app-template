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
echo -e "${BLUE}${BOLD}   EverBee Store App - Deploy${NC}"
echo -e "${BLUE}${BOLD}============================================${NC}"
echo ""

# ── Check prerequisites ──────────────────────────────────────────────

echo -e "${BOLD}Checking deploy prerequisites...${NC}"
echo ""

if [ ! -f "backend/.env" ]; then
    echo -e "${RED}backend/.env not found. Run 'npm run setup' first.${NC}"
    exit 1
fi

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found.${NC}"
    echo ""
    read -p "  Install it now? (npm i -g vercel) [Y/n]: " INSTALL_VERCEL
    INSTALL_VERCEL=${INSTALL_VERCEL:-Y}
    if [[ "$INSTALL_VERCEL" =~ ^[Yy]$ ]]; then
        npm i -g vercel
        echo ""
    else
        echo -e "${RED}Vercel CLI is required for frontend deployment.${NC}"
        exit 1
    fi
fi
echo -e "  ${GREEN}Vercel CLI found${NC}"

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI not found.${NC}"
    echo ""
    echo "  Install it:"
    echo "    macOS:   brew install railway"
    echo "    npm:     npm i -g @railway/cli"
    echo "    Other:   https://docs.railway.app/guides/cli"
    echo ""
    read -p "  Install via npm now? (npm i -g @railway/cli) [Y/n]: " INSTALL_RAILWAY
    INSTALL_RAILWAY=${INSTALL_RAILWAY:-Y}
    if [[ "$INSTALL_RAILWAY" =~ ^[Yy]$ ]]; then
        npm i -g @railway/cli
        echo ""
    else
        echo -e "${RED}Railway CLI is required for backend deployment.${NC}"
        exit 1
    fi
fi
echo -e "  ${GREEN}Railway CLI found${NC}"

echo ""

# ── Load env vars ────────────────────────────────────────────────────

source_env() {
    while IFS= read -r line; do
        line=$(echo "$line" | sed 's/#.*//' | xargs)
        if [[ -n "$line" && "$line" == *"="* ]]; then
            export "$line"
        fi
    done < "$1"
}

source_env backend/.env

# ── Build ────────────────────────────────────────────────────────────

echo -e "${BOLD}Building project...${NC}"
echo ""

echo "  Building backend..."
cd backend
npm run build
echo -e "  ${GREEN}Backend built${NC}"

echo "  Building frontend..."
cd ../frontend
npm run build
echo -e "  ${GREEN}Frontend built${NC}"

cd ..
echo ""

# ── Deploy Backend to Railway ────────────────────────────────────────

echo -e "${BOLD}Deploying backend to Railway...${NC}"
echo ""
echo "  If this is your first time, Railway will prompt you to:"
echo "    1. Log in to your Railway account"
echo "    2. Create or select a project"
echo ""

cd backend

# Check if Railway is linked
if [ ! -f ".railway/config.json" ] && [ ! -d ".railway" ]; then
    echo "  Initializing Railway project..."
    railway init
    echo ""
fi

railway up --detach

echo ""
echo -e "  ${YELLOW}Waiting for deployment to complete...${NC}"
sleep 5

# Try to get the Railway URL
RAILWAY_URL=$(railway domain 2>/dev/null || echo "")

if [ -z "$RAILWAY_URL" ]; then
    echo ""
    echo -e "  ${YELLOW}Could not auto-detect Railway URL.${NC}"
    echo "  Go to your Railway dashboard to find the deployment URL,"
    echo "  or generate a domain with: railway domain"
    echo ""
    read -p "  Enter your Railway backend URL (e.g., https://your-app.up.railway.app): " RAILWAY_URL
fi

# Ensure URL has https://
if [[ "$RAILWAY_URL" != https://* ]] && [[ "$RAILWAY_URL" != http://* ]]; then
    RAILWAY_URL="https://${RAILWAY_URL}"
fi

echo -e "  ${GREEN}Backend URL: ${RAILWAY_URL}${NC}"

# Set env vars on Railway
echo ""
echo "  Setting environment variables on Railway..."
railway variables set \
    MONGODB_URI="$MONGODB_URI" \
    EVERBEE_CLIENT_ID="$EVERBEE_CLIENT_ID" \
    EVERBEE_CLIENT_SECRET="$EVERBEE_CLIENT_SECRET" \
    EVERBEE_AUTH_URL="${EVERBEE_AUTH_URL:-https://auth.everbee.com/oauth}" \
    EVERBEE_REDIRECT_URI="${RAILWAY_URL}/api/auth/callback" \
    JWT_SECRET="$JWT_SECRET" \
    NODE_ENV="production" \
    PORT="3001" 2>/dev/null || true

echo -e "  ${GREEN}Railway env vars configured${NC}"

cd ..
echo ""

# ── Deploy Frontend to Vercel ────────────────────────────────────────

echo -e "${BOLD}Deploying frontend to Vercel...${NC}"
echo ""
echo "  If this is your first time, Vercel will prompt you to:"
echo "    1. Log in to your Vercel account"
echo "    2. Configure the project"
echo ""

cd frontend

# Set the production API URL to Railway backend
export VITE_API_URL="$RAILWAY_URL"

# Deploy to Vercel
VERCEL_OUTPUT=$(vercel --prod --yes 2>&1) || true
VERCEL_URL=$(echo "$VERCEL_OUTPUT" | grep -oE 'https://[a-zA-Z0-9._-]+\.vercel\.app' | tail -1)

if [ -z "$VERCEL_URL" ]; then
    echo ""
    echo -e "  ${YELLOW}Could not auto-detect Vercel URL from output.${NC}"
    echo ""
    read -p "  Enter your Vercel frontend URL (e.g., https://your-app.vercel.app): " VERCEL_URL
fi

echo -e "  ${GREEN}Frontend URL: ${VERCEL_URL}${NC}"

# Set env vars on Vercel
echo ""
echo "  Setting environment variables on Vercel..."
vercel env rm VITE_API_URL production --yes 2>/dev/null || true
echo "$RAILWAY_URL" | vercel env add VITE_API_URL production 2>/dev/null || true
vercel env rm VITE_APP_NAME production --yes 2>/dev/null || true
echo "${VITE_APP_NAME:-My EverBee App}" | vercel env add VITE_APP_NAME production 2>/dev/null || true

echo -e "  ${GREEN}Vercel env vars configured${NC}"

cd ..
echo ""

# ── Update Railway FRONTEND_URL ──────────────────────────────────────

echo "  Updating Railway with frontend URL..."
cd backend
railway variables set FRONTEND_URL="$VERCEL_URL" 2>/dev/null || true
cd ..
echo -e "  ${GREEN}Railway FRONTEND_URL set to ${VERCEL_URL}${NC}"

# ── Redeploy to pick up env changes ─────────────────────────────────

echo ""
echo "  Redeploying frontend with production API URL..."
cd frontend
vercel --prod --yes 2>/dev/null || true
cd ..
echo -e "  ${GREEN}Frontend redeployed${NC}"

echo ""

# ── Done ─────────────────────────────────────────────────────────────

echo -e "${GREEN}${BOLD}============================================${NC}"
echo -e "${GREEN}${BOLD}   Deployment Complete!${NC}"
echo -e "${GREEN}${BOLD}============================================${NC}"
echo ""
echo -e "  ${BOLD}Frontend:${NC}  ${VERCEL_URL}"
echo -e "  ${BOLD}Backend:${NC}   ${RAILWAY_URL}"
echo ""
echo -e "${BLUE}${BOLD}── Submit Your App to EverBee ──${NC}"
echo ""
echo "  1. Go to ${BLUE}https://store.everbee.io/admin/apps${NC}"
echo "  2. Click 'Create New App' or 'Submit App'"
echo "  3. Fill in:"
echo "       App Name:            ${APP_NAME:-Your App Name}"
echo "       App URL:             ${VERCEL_URL}"
echo "       OAuth Redirect URI:  ${RAILWAY_URL}/api/auth/callback"
echo "  4. Submit for review"
echo ""
echo -e "  ${BOLD}Update your EverBee redirect URI:${NC}"
echo "    Your production callback URL is:"
echo "    ${RAILWAY_URL}/api/auth/callback"
echo ""
echo "    Make sure this matches in your EverBee app settings."
echo ""
