# Single-origin image for Fly.io: builds the frontend and backend, then serves
# the built SPA from the Express backend (see backend/src/index.ts static serve).
# One app, one domain — API, OpenAPI spec, /docs, llms.txt and the UI all share it.
FROM node:20-slim AS build
WORKDIR /app

# Install deps for both workspaces
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
RUN npm install --prefix frontend && npm install --prefix backend

# Build
COPY frontend ./frontend
COPY backend ./backend
RUN npm run build --prefix frontend && npm run build --prefix backend

# ── Runtime ───────────────────────────────────────────────────────────
FROM node:20-slim AS run
WORKDIR /app
ENV NODE_ENV=production

COPY backend/package*.json ./backend/
RUN npm install --omit=dev --prefix backend

COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/data ./backend/data
COPY --from=build /app/frontend/dist ./frontend/dist

WORKDIR /app/backend
EXPOSE 3001
CMD ["node", "dist/index.js"]
