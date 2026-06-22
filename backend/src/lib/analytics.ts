/**
 * Product analytics — PostHog (backend).
 *
 * STANDING RULE — every EverBee app ships product analytics, and PostHog is the
 * standard. Server-side events capture what the UI can't: API/MCP-driven actions,
 * webhooks, background jobs. An LLM driving the app via /mcp is a real user — its
 * actions should show up in analytics too.
 *
 * Safe no-op when POSTHOG_KEY is unset. Call `capture(...)` from controllers /
 * services after a meaningful action (order_shipped, product_created, etc.).
 *
 * Usage:
 *   import { capture } from '../lib/analytics'
 *   capture({ distinctId: user.id, event: 'product_created', properties: { source: 'mcp' } })
 */
import { PostHog } from 'posthog-node'

const KEY = process.env.POSTHOG_KEY
const HOST = process.env.POSTHOG_HOST || 'https://us.i.posthog.com'

let client: PostHog | null = null
if (KEY) {
  client = new PostHog(KEY, { host: HOST, flushAt: 20, flushInterval: 10000 })
}

type CaptureArgs = {
  distinctId: string
  event: string
  properties?: Record<string, unknown>
}

/** Capture a server-side product event. Names: lower_snake_case, noun_verb. */
export function capture({ distinctId, event, properties }: CaptureArgs) {
  if (!client) return
  client.capture({ distinctId, event, properties })
}

/** Flush pending events — call before the process exits (e.g. in tests/cron). */
export async function flushAnalytics() {
  if (!client) return
  await client.shutdown()
}

export const analyticsEnabled = !!client
