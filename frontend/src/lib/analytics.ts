/**
 * Product analytics — PostHog (frontend).
 *
 * STANDING RULE — every EverBee app ships product analytics, and PostHog is the
 * standard. This is definition-of-done, like tests: if a feature ships without a
 * way to see whether people use it, it shipped blind.
 *
 * Initialised once in main.tsx. Safe no-op when VITE_POSTHOG_KEY is unset (local
 * dev without a key) — code can call `track(...)` unconditionally.
 *
 * Usage:
 *   import { track, identifyUser } from '@/lib/analytics'
 *   track('product_created', { source: 'csv_upload', count: 12 })
 *   identifyUser(user.id, { store_id, plan })
 */
import posthog from 'posthog-js'

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://us.i.posthog.com'

let enabled = false

export function initAnalytics() {
  if (enabled || !KEY) return
  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    persistence: 'localStorage+cookie',
  })
  enabled = true
}

/** Capture a product event. Names: lower_snake_case, noun_verb (e.g. order_shipped). */
export function track(event: string, properties?: Record<string, unknown>) {
  if (!enabled) return
  posthog.capture(event, properties)
}

/** Tie events to a known user once they authenticate. */
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!enabled) return
  posthog.identify(userId, properties)
}

/** Clear identity on logout so the next session is anonymous. */
export function resetAnalytics() {
  if (!enabled) return
  posthog.reset()
}

export { posthog }
