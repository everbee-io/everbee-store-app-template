#!/usr/bin/env node
/**
 * MCP server for an EverBee Store app.
 *
 * It does NOT hardcode tools. On startup it fetches the app's live OpenAPI spec
 * (GET {APP_URL}/openapi.json) and generates one MCP tool per operation. That is
 * the whole point: when you add or change an endpoint, you update src/openapi.ts
 * in the backend and this server picks it up automatically — the MCP can never
 * silently drift from the API.
 *
 * Env:
 *   APP_URL    base URL of the running app   (default http://localhost:3001)
 *   APP_TOKEN  bearer token for authenticated endpoints (POST /api/auth/login)
 *
 * Run:  APP_URL=https://my-app.fly.dev APP_TOKEN=... npm run dev
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

const APP_URL = (process.env.APP_URL || 'http://localhost:3001').replace(/\/$/, '')
const APP_TOKEN = process.env.APP_TOKEN || ''

type Op = {
  name: string
  method: string
  path: string
  description: string
  params: { name: string; in: 'path' | 'query'; required: boolean }[]
  hasBody: boolean
  inputSchema: any
}

async function loadOperations(): Promise<Op[]> {
  const res = await fetch(`${APP_URL}/openapi.json`)
  if (!res.ok) throw new Error(`Failed to fetch ${APP_URL}/openapi.json: ${res.status}`)
  const spec: any = await res.json()
  const ops: Op[] = []

  for (const [path, methods] of Object.entries<any>(spec.paths || {})) {
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

async function callOperation(op: Op, args: Record<string, any>): Promise<string> {
  let url = op.path
  const query = new URLSearchParams()
  for (const p of op.params) {
    const v = args[p.name]
    if (v === undefined) continue
    if (p.in === 'path') url = url.replace(`{${p.name}}`, encodeURIComponent(String(v)))
    else query.set(p.name, String(v))
  }
  const qs = query.toString()
  const full = `${APP_URL}${url}${qs ? `?${qs}` : ''}`

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (APP_TOKEN) headers.Authorization = `Bearer ${APP_TOKEN}`

  const res = await fetch(full, {
    method: op.method,
    headers,
    body: op.hasBody && args.body !== undefined ? JSON.stringify(args.body) : undefined,
  })
  const text = await res.text()
  return `${res.status} ${res.statusText}\n${text}`
}

async function main() {
  const ops = await loadOperations()
  const byName = new Map(ops.map((o) => [o.name, o]))

  const server = new Server(
    { name: 'everbee-store-app-mcp', version: '1.0.0' },
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
    const out = await callOperation(op, req.params.arguments || {})
    return { content: [{ type: 'text', text: out }] }
  })

  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error(`everbee-store-app-mcp ready — ${ops.length} tools from ${APP_URL}/openapi.json`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
