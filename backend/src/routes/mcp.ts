/**
 * Hosted HTTP MCP — the headless head of this app.
 *
 * STANDING RULE — HEADLESS BY DEFAULT. Every deployed app exposes a public,
 * discoverable Model Context Protocol endpoint at GET/POST /mcp on the SAME
 * origin as the API. Anyone can add `https://<app>/mcp` to Claude (or any LLM
 * client) and drive the app in natural language. They authenticate with their
 * OWN EverBee store token / API secret via `Authorization: Bearer <token>`, so a
 * caller only ever touches their own store's data. This is multi-tenant
 * headless: one public endpoint, per-caller auth, zero cross-store leakage.
 *
 * Tools are generated from the live OpenAPI spec (src/openapi.ts) at request
 * time — one tool per operation, never hand-maintained, never drifts. Add or
 * change a route + its openapi entry and the MCP picks it up for free.
 *
 * Opt out: set APP_VISIBILITY=private and this endpoint is disabled (404) —
 * the same single toggle that closes LLM crawlability. Closed is the exception.
 *
 * Transport: streamable HTTP, stateless (no session continuity). A fresh MCP
 * server + transport is built per request, scoped to the caller's token; tool
 * calls are forwarded back through the app's own API so all existing auth
 * middleware applies unchanged.
 */
import { Router, type Request, type Response } from 'express'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { openApiSpec } from '../openapi'

const router = Router()

const IS_PRIVATE = (process.env.APP_VISIBILITY || 'public').toLowerCase() === 'private'
const PORT = process.env.PORT || 3001
// Forward tool calls back through the app's own HTTP API (loopback) so every
// request passes the same auth/validation middleware the UI uses. The round
// trip never leaves the machine.
const SELF_BASE = `http://127.0.0.1:${PORT}`

type Op = {
  name: string
  method: string
  path: string
  description: string
  params: { name: string; in: 'path' | 'query'; required: boolean }[]
  hasBody: boolean
  inputSchema: any
}

/** Build one tool descriptor per OpenAPI operation, in-process from the spec. */
function loadOperations(): Op[] {
  const ops: Op[] = []
  for (const [path, methods] of Object.entries<any>((openApiSpec as any).paths || {})) {
    for (const [method, op] of Object.entries<any>(methods)) {
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue
      const properties: Record<string, any> = {}
      const required: string[] = []
      const params: Op['params'] = []

      for (const p of op.parameters || []) {
        properties[p.name] = { ...(p.schema || { type: 'string' }), description: p.description }
        if (p.required) required.push(p.name)
        params.push({ name: p.name, in: p.in, required: !!p.required })
      }

      const hasBody = !!op.requestBody
      if (hasBody) {
        const bodySchema =
          op.requestBody.content?.['application/json']?.schema || { type: 'object' }
        properties.body = { ...bodySchema, description: 'JSON request body' }
        if (op.requestBody.required) required.push('body')
      }

      ops.push({
        name: op.operationId || `${method}_${path}`.replace(/\W+/g, '_'),
        method: method.toUpperCase(),
        path,
        description: op.summary || op.description || `${method.toUpperCase()} ${path}`,
        params,
        hasBody,
        inputSchema: { type: 'object', properties, required },
      })
    }
  }
  return ops
}

/** Forward a tool invocation to the app's own API with the caller's token. */
async function callOperation(
  op: Op,
  args: Record<string, any>,
  bearer: string
): Promise<string> {
  let path = op.path
  const query = new URLSearchParams()
  for (const p of op.params) {
    const v = args[p.name]
    if (v === undefined) continue
    if (p.in === 'path') path = path.replace(`{${p.name}}`, encodeURIComponent(String(v)))
    else query.set(p.name, String(v))
  }
  const qs = query.toString()
  const url = `${SELF_BASE}${path}${qs ? `?${qs}` : ''}`

  const res = await fetch(url, {
    method: op.method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` },
    body: op.hasBody && args.body !== undefined ? JSON.stringify(args.body) : undefined,
  })
  const text = await res.text()
  return `${res.status} ${res.statusText}\n${text}`
}

/** Fresh MCP server scoped to one caller's bearer token. */
function buildServer(bearer: string): Server {
  const ops = loadOperations()
  const byName = new Map(ops.map((o) => [o.name, o]))

  const server = new Server(
    { name: openApiSpec?.info?.title || 'everbee-store-app', version: '1.0.0' },
    { capabilities: { tools: {} } }
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: ops.map((o) => ({
      name: o.name,
      description: `${o.description} (${o.method} ${o.path})`,
      inputSchema: o.inputSchema,
    })),
  }))

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const op = byName.get(req.params.name)
    if (!op) throw new Error(`Unknown tool: ${req.params.name}`)
    const out = await callOperation(op, req.params.arguments || {}, bearer)
    return { content: [{ type: 'text', text: out }] }
  })

  return server
}

router.all('/', async (req: Request, res: Response) => {
  if (IS_PRIVATE) {
    res.status(404).json({ error: 'MCP endpoint disabled (APP_VISIBILITY=private)' })
    return
  }

  // Open CORS — MCP clients (Claude, the Anthropic SDK) may connect from anywhere.
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-Id'
  )
  res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  // Per-caller auth: the user's own EverBee store token / API secret.
  const auth = req.headers['authorization']
  const bearer =
    typeof auth === 'string' && auth.startsWith('Bearer ') ? auth.slice(7).trim() : null
  if (!bearer) {
    res
      .status(401)
      .json({ error: 'Bearer token required in Authorization header (your EverBee store token)' })
    return
  }

  // Stateless: a fresh server + transport per request, scoped to this token.
  const server = buildServer(bearer)
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })

  try {
    await server.connect(transport)
    // express.json() already parsed the body — hand it to the transport directly.
    await transport.handleRequest(req as any, res as any, req.body)
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: String(err) })
    }
  }
})

export default router
