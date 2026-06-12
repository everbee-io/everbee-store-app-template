#!/usr/bin/env node
/**
 * Autonomous release notes — the FULL git history grouped by DAY (newest first),
 * commit subjects cleaned into plain language, one entry per day with an emoji.
 * Regenerated on every deploy by scripts/deploy-fly.sh. No hand-written changelog.
 *
 * Output shape (backend/data/release-notes.json), consumed by the route + the
 * "What's New" page:
 *   [{ version: "<YYYY-MM-DD>", date, emoji, highlights[], changes[{type,summary}] }]
 *
 * STANDING RULE — every app ships autonomous release notes. Keep this running.
 */
import { execSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'backend', 'data', 'release-notes.json')

const KNOWN = new Set(['feat', 'fix', 'perf', 'refactor', 'docs', 'chore'])

function sh(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

// commit date (YYYY-MM-DD) <TAB> subject, newest first. %x09 is git's tab escape
// (a literal tab in the command string would be split by the shell).
const log = sh('git log --pretty=format:%cd%x09%s --date=short').split('\n').filter(Boolean)

/** @type {Map<string, { highlights: string[]; changes: {type:string;summary:string}[] }>} */
const byDay = new Map()
for (const line of log) {
  const tab = line.indexOf('\t')
  if (tab < 0) continue
  const date = line.slice(0, tab)
  const subject = line.slice(tab + 1)
  if (/^(auto:|release |Merge )/i.test(subject)) continue
  const m = subject.match(/^(\w+)(\([^)]*\))?!?:\s*(.+)$/)
  const type = m && KNOWN.has(m[1]) ? m[1] : 'other'
  let summary = (m ? m[3] : subject).trim()
  summary = summary.charAt(0).toUpperCase() + summary.slice(1)
  const d = byDay.get(date) ?? { highlights: [], changes: [] }
  d.changes.push({ type, summary })
  if (type === 'feat') d.highlights.push(summary)
  byDay.set(date, d)
}

// Map preserves insertion order = git-log order = newest day first.
const releases = []
for (const [date, d] of byDay) {
  const meaningful = d.changes.filter((c) => ['feat', 'fix', 'perf'].includes(c.type))
  if (meaningful.length === 0 && d.highlights.length === 0) continue
  const emoji = d.highlights.length ? '🚀' : d.changes.some((c) => c.type === 'fix') ? '🛠️' : '✨'
  releases.push({
    version: date, // the date is the stable key (one entry per day)
    date,
    emoji,
    highlights: d.highlights.slice(0, 8),
    changes: d.changes,
  })
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(releases, null, 2) + '\n')
console.log(`Wrote ${releases.length} day(s) of release notes.`)
