/**
 * "How It Works" — a REQUIRED page on every EverBee app (build standard).
 *
 * It shows, in one place: a diagram of how the system actually works, a
 * plain-English explanation, and a technical hint. This is the YouTube-listener
 * "How it works" pattern, generalized.
 *
 * STANDING RULE: any change to the system's mechanics must update this page —
 * the diagram, the plain-English steps, AND the technical hint — in the SAME
 * change. If the picture here is stale, the rule was broken.
 */
import { useEffect, useState } from 'react'

const STEPS = [
  {
    title: 'Install (OAuth)',
    plain:
      'A seller installs the app from the EverBee Store. EverBee hands us a one-time code; we exchange it for an access token scoped to their store.',
    tech: 'GET /api/auth/install → EverBee OAuth → GET /api/auth/callback exchanges the code, upserts the Store, mints an app JWT.',
  },
  {
    title: 'Act on the store',
    plain:
      "Every screen in the admin is also an API call. The backend uses the store's token to read and write products, orders, collections and customers on EverBee.",
    tech: 'React admin → /api/* (Express) → EverBeeClient (X-Access-Token + Store-Id) → EverBee Store API.',
  },
  {
    title: 'Describe it (OpenAPI)',
    plain:
      'The whole API is described in a machine-readable contract, with human docs alongside it.',
    tech: 'backend/src/openapi.ts is served at /openapi.json; Swagger UI at /docs.',
  },
  {
    title: 'Drive it with AI (MCP)',
    plain:
      'A public MCP server turns that API into natural-language tools, so anyone can run the app from an LLM using their own store token — scoped to only their store.',
    tech: 'Public /mcp generated from the OpenAPI spec — one tool per endpoint, per-caller Bearer auth, can never drift. APP_VISIBILITY=private disables it.',
  },
  {
    title: 'Be found (LLM-crawlable)',
    plain:
      'The app is open to AI by default — it publishes an index for LLMs and welcomes AI crawlers. Private apps opt out explicitly.',
    tech: '/llms.txt, /llms-full.txt, /robots.txt (AI-allow), /sitemap.xml. Set APP_VISIBILITY=private to close it.',
  },
]

function Diagram() {
  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 900 230" className="w-full min-w-[760px]" role="img" aria-label="System diagram">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#6366f1" />
          </marker>
        </defs>
        {[
          { x: 10, label: 'EverBee Store', sub: 'OAuth + Store API' },
          { x: 195, label: 'App Backend', sub: 'Express /api/*' },
          { x: 380, label: 'OpenAPI', sub: '/openapi.json' },
          { x: 565, label: 'MCP Server', sub: 'NL tools' },
          { x: 750, label: 'Claude / Team', sub: 'plain English' },
        ].map((b) => (
          <g key={b.x}>
            <rect x={b.x} y={70} width={140} height={70} rx={10} fill="#eef2ff" stroke="#6366f1" />
            <text x={b.x + 70} y={100} textAnchor="middle" fontSize="15" fontWeight="600" fill="#3730a3">
              {b.label}
            </text>
            <text x={b.x + 70} y={120} textAnchor="middle" fontSize="11" fill="#6366f1">
              {b.sub}
            </text>
          </g>
        ))}
        {[150, 335, 520, 705].map((x) => (
          <line key={x} x1={x} y1={105} x2={x + 45} y2={105} stroke="#6366f1" strokeWidth={2} markerEnd="url(#arrow)" />
        ))}
        <text x={450} y={185} textAnchor="middle" fontSize="12" fill="#9ca3af">
          Product → API → MCP move together. Release notes + this page update with every change.
        </text>
      </svg>
    </div>
  )
}

export default function HowItWorksPage() {
  const [appName] = useState('This app')
  useEffect(() => {
    document.title = 'How It Works'
  }, [])

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-gray-900">How It Works</h1>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
          Internal · EverBee team
        </span>
      </div>
      <p className="text-gray-600 mb-8">
        {appName} is an EverBee Store app. Here's the whole system, end to end.
        This page is visible only to EverBee staff.
      </p>

      <div className="card mb-8">
        <Diagram />
      </div>

      <div className="space-y-4">
        {STEPS.map((s, i) => (
          <div key={s.title} className="card">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-gray-600 mb-2">{s.plain}</p>
                <p className="text-xs font-mono text-gray-400">{s.tech}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-400 mt-8">
        Machine interfaces:{' '}
        <a className="text-primary-600 underline" href="/openapi.json">/openapi.json</a> ·{' '}
        <a className="text-primary-600 underline" href="/docs">/docs</a> ·{' '}
        <a className="text-primary-600 underline" href="/llms.txt">/llms.txt</a>
      </p>
    </div>
  )
}
