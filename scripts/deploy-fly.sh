#!/bin/bash
# Fly-first deploy for EverBee apps. Single Fly app serves the API + the built
# SPA + the OpenAPI/MCP/LLM surface from one origin.
#
# RULE: regenerate autonomous release notes FIRST, then deploy. (GitHub-push
# before deploy is handled in your normal flow — commit + push, then run this.)
set -e

GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${BLUE}EverBee app — Fly deploy${NC}"

if ! command -v fly &> /dev/null; then
  echo -e "${RED}flyctl not found. Install: https://fly.io/docs/flyctl/install/${NC}"
  exit 1
fi

# 1. Autonomous release notes (standing rule — runs every deploy)
echo -e "${YELLOW}Generating release notes from git history...${NC}"
node scripts/release-notes.mjs || true

APP_NAME=$(grep -E '^app\s*=' fly.toml | head -1 | sed 's/.*=\s*"\(.*\)"/\1/')
PUBLIC_URL="https://${APP_NAME}.fly.dev"

# 2. First-time app create (idempotent)
if ! fly status --app "$APP_NAME" &> /dev/null; then
  echo -e "${YELLOW}Creating Fly app ${APP_NAME}...${NC}"
  fly apps create "$APP_NAME" || true
fi

# 3. Public URL so OpenAPI/llms.txt advertise the right origin
fly secrets set PUBLIC_URL="$PUBLIC_URL" --app "$APP_NAME" --stage >/dev/null 2>&1 || true

echo -e "${YELLOW}Set your secrets if you haven't:${NC}"
echo "  fly secrets set MONGODB_URI=... EVERBEE_CLIENT_ID=... EVERBEE_CLIENT_SECRET=... JWT_SECRET=... --app $APP_NAME"
echo ""

# 4. Deploy
fly deploy --app "$APP_NAME"

echo ""
echo -e "${GREEN}Deployed:${NC} ${PUBLIC_URL}"
echo -e "  App:        ${PUBLIC_URL}/"
echo -e "  OpenAPI:    ${PUBLIC_URL}/openapi.json"
echo -e "  API docs:   ${PUBLIC_URL}/docs"
echo -e "  llms.txt:   ${PUBLIC_URL}/llms.txt"
echo -e "  EverBee redirect URI: ${PUBLIC_URL}/api/auth/callback"
