# MCP — natural-language tools for this app

This is the **MCP layer** required by the EverBee app build standard: every app
ships an MCP on top of its OpenAPI API so Claude and the team can drive it in
plain English.

## Two ways to connect

**1. Hosted HTTP — the default (headless by default).** The deployed app already
serves a public, discoverable MCP at **`/mcp` on its own origin** — nothing to
install. Add the URL to Claude or any LLM client and authenticate with your own
EverBee store token:

```
URL:    https://<your-app>.fly.dev/mcp
Header: Authorization: Bearer <your store token>
```

You only ever touch your own store's data. `APP_VISIBILITY=private` disables it.
Implementation: `backend/src/routes/mcp.ts`. **This package below is the
local-dev / stdio option.**

## How it stays in sync (read this)

This server **generates its tools from the app's live OpenAPI spec** at startup —
it fetches `GET {APP_URL}/openapi.json` and creates one tool per operation. There
is no per-endpoint tool code to maintain. The sync rule is satisfied structurally:

```
product change → update src/routes/* and src/openapi.ts → MCP picks it up
```

You only touch this package when you want to override a tool name/description or
add custom logic. Otherwise, keeping `backend/src/openapi.ts` accurate is the
whole job.

## Run (local stdio)

```bash
cd mcp
npm install
APP_URL=http://localhost:3001 APP_TOKEN=<bearer-token> npm run dev
```

Get `APP_TOKEN` from `POST /api/auth/login`.

## Use from Claude Code / Claude Desktop (stdio)

```json
{
  "mcpServers": {
    "my-everbee-app": {
      "command": "node",
      "args": ["/abs/path/to/mcp/dist/index.js"],
      "env": { "APP_URL": "https://my-app.fly.dev", "APP_TOKEN": "..." }
    }
  }
}
```

Prefer the hosted `/mcp` endpoint (above) for anything shared — stdio is for local
development against a running backend.
