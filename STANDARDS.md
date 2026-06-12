# EverBee App Build Standards

Every app built from this template ships these layers. They are part of the
definition of done — like tests. They move together: **product → API → MCP**, and
the docs/notes/diagram follow. This file is the authoritative checklist; the
`/new-everbee-app` skill enforces it.

| # | Standard | Where | The rule |
|---|----------|-------|----------|
| 1 | **OpenAPI spec** | `backend/src/openapi.ts` → `GET /openapi.json`, `/docs` | The API contract, not documentation. Every endpoint is described here. |
| 2 | **Headless MCP (hosted, public)** | `backend/src/routes/mcp.ts` (hosted HTTP at `/mcp`) + `mcp/` (local stdio) | Generates one tool per endpoint from the **live** `/openapi.json`. The deployed app serves a public, discoverable `/mcp` on the same origin — anyone connects their LLM and drives the app with their OWN store token (per-caller `Authorization: Bearer`, no cross-store leakage). Update the route + spec → MCP auto-syncs. Never let them drift. |
| 3 | **LLM-crawlable by default** | `backend/src/routes/meta.ts`, `frontend/index.html`, `frontend/public/` | `/llms.txt`, `/llms-full.txt`, AI-allow `/robots.txt`, `/sitemap.xml`, JSON-LD. Public by default. `APP_VISIBILITY=private` closes BOTH crawlability and `/mcp` — closed is the exception. |
| 4 | **Autonomous release notes** | `scripts/release-notes.mjs` → `GET /api/release-notes` (+ `/rss.xml`) → "What's New" page | Generated from the full git history on every deploy, **grouped by day** (one emoji-tagged entry per day, newest first). The What's New page renders them as a light, collapsible day-by-day timeline. No hand-written changelog. |
| 5 | **How It Works admin page (EverBee staff only)** | `frontend/src/pages/HowItWorks`, gated by `EverbeeTeamRoute` (`@everbee.io`) | Internal page — hidden from sellers in nav and by URL; only `@everbee.io` users see it. Diagram + plain English + technical hint. Any change to mechanics updates this page (diagram included) in the SAME change. |
| 6 | **Fly-first / GitHub-first deploy** | `Dockerfile`, `fly.toml`, `scripts/deploy-fly.sh` | Single-origin Fly app. Commit + push to GitHub before deploying. |
| 7 | **Product analytics (PostHog)** | `frontend/src/lib/analytics.ts`, `backend/src/lib/analytics.ts` | Every app ships PostHog. Track the key action of every feature (frontend `track()`, server/MCP-driven `capture()`). No `track`/`capture` on a feature's core action = shipped blind. No-op without a key. |

## Config & secrets

Every runnable unit (`backend/`, `frontend/`, `mcp/`) ships a committed
**`.env.example`** — the config contract listing every variable the app needs
(and nothing secret). The real **`.env`** is gitignored and NEVER committed.

In production, secrets go to **Fly secrets** (or Keychain for local tools), not a
committed file: `fly secrets set MONGODB_URI=... EVERBEE_CLIENT_SECRET=... --app <app>`.
No plaintext keys on disk, in git, or in chat.

## The sync invariant (the load-bearing rule)

When you add, change, or remove a backend route:

1. Update `backend/src/routes/*` (the product).
2. Update `backend/src/openapi.ts` in the **same change** (the contract).
3. The `mcp/` server needs no edits — it regenerates tools from the spec.
4. If the change alters how the system works, update `frontend/src/pages/HowItWorks`.

If you touched an endpoint and didn't touch `openapi.ts`, you broke the rule. The
MCP, the docs, and every LLM that drives the app now believe something false.

## Why

Cody builds an agentic-first portfolio: every tool should be Claude-drivable and
discoverable. OpenAPI is the machine-readable contract; the hosted `/mcp` is the
natural-language head that makes the app **headless by default** — anyone can
drive it from their own LLM with their own store token; LLM-crawlability makes the
app findable; the release notes and How It Works page keep humans and agents
oriented as it evolves; and PostHog product analytics means we can see what people
(and agents) actually use, so decisions run on data, not vibes. Keeping them in
lockstep is what makes the whole system queryable, drivable, and trustworthy.
