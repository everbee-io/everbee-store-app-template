/**
 * Meta routes — the machine-legible surface of the app. Mounted at the ROOT
 * (not /api) so crawlers and LLMs find them at conventional paths.
 *
 *   GET /openapi.json   the API contract (src/openapi.ts)
 *   GET /docs           human-readable Swagger UI over that contract
 *   GET /llms.txt       short LLM index (the llms.txt convention)
 *   GET /llms-full.txt  fuller LLM context (endpoints + how-it-works)
 *   GET /robots.txt     ALLOWS AI crawlers by default; private mode blocks them
 *   GET /sitemap.xml    basic sitemap
 *
 * STANDING RULE — LLM-crawlable by default. A public app is open to GPTBot,
 * ClaudeBot, PerplexityBot, etc. out of the box. To make an app private, set
 * APP_VISIBILITY=private — robots.txt then disallows everything. Closed is the
 * deliberate exception, never the default.
 */
import { Router } from 'express'
import { openApiSpec } from '../openapi'

const router = Router()

const APP_NAME = process.env.APP_NAME || 'EverBee Store App'
const APP_DESCRIPTION =
  process.env.APP_DESCRIPTION || 'An app built on the EverBee Store platform.'
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3001'
const IS_PRIVATE = (process.env.APP_VISIBILITY || 'public').toLowerCase() === 'private'

// AI crawlers we explicitly welcome when public.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'Bytespider',
]

router.get('/openapi.json', (_req, res) => {
  res.json(openApiSpec)
})

router.get('/docs', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${APP_NAME} — API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({ url: '/openapi.json', dom_id: '#swagger' })
    </script>
  </body>
</html>`)
})

function endpointLines(): string {
  const lines: string[] = []
  for (const [path, methods] of Object.entries(openApiSpec.paths)) {
    for (const [method, op] of Object.entries(methods as Record<string, any>)) {
      lines.push(`- ${method.toUpperCase()} ${path} — ${op.summary || op.operationId}`)
    }
  }
  return lines.join('\n')
}

router.get('/llms.txt', (_req, res) => {
  res.type('text/plain').send(`# ${APP_NAME}

> ${APP_DESCRIPTION}

This app is built on the EverBee Store platform. It is agent-friendly: the full
API is described in OpenAPI and wrapped by an MCP server so an LLM can drive it
directly.

## Machine interfaces
- API contract (OpenAPI): ${PUBLIC_URL}/openapi.json
- API docs (Swagger): ${PUBLIC_URL}/docs
- Fuller LLM context: ${PUBLIC_URL}/llms-full.txt
- Release notes: ${PUBLIC_URL}/api/release-notes
- MCP endpoint (hosted): ${PUBLIC_URL}/mcp — add this URL to Claude or any LLM
  client to drive the app in natural language. Auth with your own EverBee store
  token via Authorization: Bearer <token>.

## Auth
Get an access token via POST /api/auth/login, then send it as
\`Authorization: Bearer <token>\` on /api/* requests (and to the /mcp endpoint).
`)
})

router.get('/llms-full.txt', (_req, res) => {
  res.type('text/plain').send(`# ${APP_NAME} — full LLM context

> ${APP_DESCRIPTION}

## How it works
EverBee Store installs this app via OAuth. The app backend exchanges the code
for an access token, stores it per-store, and calls the EverBee Store API on the
seller's behalf. Everything the UI can do is also an HTTP endpoint (below),
described in OpenAPI and exposed as MCP tools.

Layers (kept in lockstep — product → API → MCP):
1. Product: the React admin + Express backend.
2. API: documented at ${PUBLIC_URL}/openapi.json.
3. MCP: a hosted, public endpoint at ${PUBLIC_URL}/mcp — natural-language tools
   over that API, one per operation. Connect any LLM client and authenticate
   with your own store token; you only ever touch your own store's data.

## Endpoints
${endpointLines()}

## Auth
POST /api/auth/login → { accessToken }. Send Authorization: Bearer <token>.
`)
})

router.get('/robots.txt', (_req, res) => {
  if (IS_PRIVATE) {
    res.type('text/plain').send(`# private app — crawling disabled
User-agent: *
Disallow: /
`)
    return
  }
  const allowBlocks = AI_CRAWLERS.map(
    (ua) => `User-agent: ${ua}\nAllow: /`
  ).join('\n\n')
  res.type('text/plain').send(`# ${APP_NAME} — open to AI crawlers by default
${allowBlocks}

User-agent: *
Allow: /

Sitemap: ${PUBLIC_URL}/sitemap.xml
`)
})

router.get('/sitemap.xml', (_req, res) => {
  if (IS_PRIVATE) {
    res.status(404).end()
    return
  }
  const urls = ['/', '/docs', '/llms.txt', '/mcp']
    .map((p) => `  <url><loc>${PUBLIC_URL}${p}</loc></url>`)
    .join('\n')
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`)
})

export default router
