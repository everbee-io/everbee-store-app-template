# EverBee Store App Template — agent instructions

This is the canonical template for every EverBee app (internal or external). When
you build or modify an app from this template, you MUST uphold the build standards
in [STANDARDS.md](./STANDARDS.md). They are definition-of-done, like tests.

## The standing rules (do not skip)

1. **OpenAPI is the contract.** Every endpoint in `backend/src/routes/*` is
   described in `backend/src/openapi.ts`. Add/change a route → update the spec in
   the SAME change.
2. **Headless by default — hosted MCP rides the spec.** Every deployed app
   exposes a public, discoverable HTTP MCP at `/mcp` on the same origin
   (`backend/src/routes/mcp.ts`), generated from the live `/openapi.json`. Anyone
   can point Claude (or any LLM) at `https://<app>/mcp` and drive it; they
   authenticate with their OWN EverBee store token (`Authorization: Bearer`), so
   each caller only touches their own store's data. The `mcp/` stdio package is
   the local-dev option. Keep the spec accurate and both stay correct for free —
   never hand-desync.
3. **LLM-crawlable by default.** Public apps stay open to AI crawlers
   (`backend/src/routes/meta.ts`). `APP_VISIBILITY=private` is the single toggle
   that closes BOTH crawlability and the `/mcp` endpoint.
4. **Autonomous release notes.** Never hand-write a changelog —
   `scripts/release-notes.mjs` generates them on deploy; the "What's New" page shows them.
5. **How It Works stays current (EverBee staff only).** It's an internal page —
   gated to `@everbee.io` users via `EverbeeTeamRoute` + `useCurrentUser`; regular
   sellers never see it in nav or by URL. Any change to how the system works
   updates `frontend/src/pages/HowItWorks` — diagram, plain-English steps, AND
   technical hint.
6. **Fly-first, GitHub-first.** Commit + push before deploying. Use
   `scripts/deploy-fly.sh`. Don't run `fly deploy` directly unless Cody asks.
7. **Always ship product analytics (PostHog).** Wire events through
   `frontend/src/lib/analytics.ts` and `backend/src/lib/analytics.ts`. A feature
   that ships without a `track`/`capture` on its key action shipped blind. No-op
   without a key, so it's safe to call everywhere.
8. **Submission is a runbook, not a scavenger hunt.** Registering on dev.everbee.io
   asks the same things every time — see [EVERBEE-SUBMISSION.md](./EVERBEE-SUBMISSION.md)
   for the field-by-field guide + gotchas, and run
   `./scripts/registration-values.sh https://<api> https://<web>` to print every
   value to paste. The template ships the required `/api/auth/uninstall` so the
   portal never blocks you. Store the Client ID/Secret in Keychain `cody-os/<app>-*`.

## The one-line test

If you touched an endpoint and didn't touch `openapi.ts`, you broke the rule. If
you changed the mechanics and didn't touch the How It Works page, you broke the rule.

## Architecture

- `frontend/` — React 18 + Vite + Tailwind admin (also serves the public crawl surface in dev)
- `backend/` — Express + TypeScript + MongoDB; serves `/api/*`, the OpenAPI/meta routes, and (in prod) the built SPA
- `mcp/` — MCP server, tools generated from `/openapi.json`
- `scripts/` — `setup.sh`, `dev.sh`, `deploy-fly.sh` (default), `release-notes.mjs`, `deploy.sh` (legacy split)
