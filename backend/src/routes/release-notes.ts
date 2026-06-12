/**
 * Release notes — autonomous. The notes are GENERATED from git history by
 * scripts/release-notes.mjs (run on every deploy), written to
 * backend/data/release-notes.json, and served here. Nobody hand-maintains a
 * changelog.
 *
 *   GET /api/release-notes         all releases (public, crawlable)
 *   GET /api/release-notes/latest  the newest release only
 *   GET /api/release-notes/rss.xml RSS 2.0 feed (Subscribe via RSS)
 *
 * STANDING RULE — every app ships autonomous release notes. The generator runs
 * itself; this route just surfaces them in-app (see the frontend "What's New"
 * page) and to LLMs (linked from /llms.txt).
 */
import { Router } from 'express'
import { readFileSync } from 'fs'
import { join } from 'path'

const router = Router()

type Release = {
  version: string // the day, YYYY-MM-DD (one entry per day)
  date: string
  emoji?: string
  highlights?: string[]
  changes: { type: string; summary: string }[]
}

const NOTES_PATH = join(__dirname, '../../data/release-notes.json')

function load(): Release[] {
  try {
    return JSON.parse(readFileSync(NOTES_PATH, 'utf8')) as Release[]
  } catch {
    return []
  }
}

router.get('/', (_req, res) => {
  res.json({ releases: load() })
})

router.get('/latest', (_req, res) => {
  const releases = load()
  if (releases.length === 0) {
    return res.json({ release: null })
  }
  res.json({ release: releases[0] })
})

const APP_NAME = process.env.APP_NAME || 'EverBee Store App'
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3001'

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Render a release as the body of an RSS <item>. */
function itemBody(r: Release): string {
  const parts: string[] = []
  for (const h of r.highlights ?? []) parts.push(`• ${h}`)
  for (const c of r.changes) parts.push(`[${c.type}] ${c.summary}`)
  return parts.join('\n')
}

router.get('/rss.xml', (_req, res) => {
  const releases = load()
  const items = releases
    .map((r) => {
      const headline = r.highlights?.[0] || r.changes[0]?.summary || `Updates — ${r.date}`
      const title = `${r.emoji ? `${r.emoji} ` : ''}${headline}`
      // RFC-822-ish date from YYYY-MM-DD (midnight UTC) for feed readers.
      const pubDate = new Date(`${r.date}T00:00:00Z`).toUTCString()
      return `    <item>
      <title>${xmlEscape(title)}</title>
      <link>${PUBLIC_URL}/whats-new</link>
      <guid isPermaLink="false">${xmlEscape(`${APP_NAME}-${r.date}`)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${xmlEscape(itemBody(r))}</description>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(`${APP_NAME} — What's New`)}</title>
    <link>${PUBLIC_URL}/whats-new</link>
    <description>${xmlEscape(`Release notes for ${APP_NAME}.`)}</description>
${items}
  </channel>
</rss>`

  res.type('application/rss+xml').send(xml)
})

export default router
