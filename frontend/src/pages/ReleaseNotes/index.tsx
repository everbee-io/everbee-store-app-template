/**
 * "What's New" / Changelog — a REQUIRED page on every EverBee app.
 *
 * Autonomous: scripts/release-notes.mjs regenerates backend/data/release-notes.json
 * from the FULL git history on every deploy (grouped by day, newest first), served
 * at /api/release-notes. Nobody hand-writes a changelog. This page renders it as a
 * light, collapsible day-by-day timeline with an RSS subscribe link.
 */
import { useEffect, useState } from 'react'
import { Rss, ChevronDown, ChevronRight } from 'lucide-react'
import { api } from '../../lib/api-client'
import { getBackendBaseUrl } from '../../lib/backend-url'

type Release = {
  version: string
  date: string
  emoji?: string
  highlights?: string[]
  changes: { type: string; summary: string }[]
}

// Only the change types a user cares about surface as bullets; the rest fold away.
const TYPE_DOT: Record<string, string> = {
  feat: 'bg-indigo-500',
  fix: 'bg-emerald-500',
  perf: 'bg-amber-500',
}
const VISIBLE = new Set(Object.keys(TYPE_DOT))

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function parseDate(iso: string) {
  const [y, m, d] = (iso || '').split('-').map(Number)
  if (!y || !m || !d) return { month: '', day: '', full: iso }
  return { month: MONTHS[m - 1] ?? '', day: String(d), full: `${MONTHS[m - 1]} ${d}, ${y}` }
}

function DayEntry({ r, isLast }: { r: Release; isLast: boolean }) {
  const [open, setOpen] = useState(true)
  const { month, day, full } = parseDate(r.date)
  const meaningful = r.changes.filter((c) => VISIBLE.has(c.type))
  const headline = r.highlights?.[0] ?? meaningful[0]?.summary ?? 'Updates'
  const bullets = meaningful.filter((c) => c.summary !== headline)

  return (
    <div className="flex gap-4 sm:gap-6">
      {/* date rail + connector */}
      <div className="flex w-12 shrink-0 flex-col items-center">
        <div className="text-center leading-none">
          <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">{month}</div>
          <div className="mt-1 text-xl font-bold text-gray-900">{day}</div>
        </div>
        <span className="mt-2.5 h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.12)]" />
        {!isLast && <span className="mt-1.5 w-px flex-1 bg-gray-200" />}
      </div>

      {/* card */}
      <div className="mb-6 min-w-0 flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start gap-3 px-5 pt-4 text-left">
          <span className="text-lg leading-none">{r.emoji ?? '✨'}</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold leading-snug tracking-tight text-gray-900">{headline}</span>
            <span className="mt-0.5 block text-xs text-gray-400">{full}</span>
          </span>
          <span className="mt-0.5 shrink-0 text-gray-400">
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        </button>

        {open &&
          (bullets.length > 0 ? (
            <ul className="space-y-1.5 pb-4 pl-14 pr-5 pt-3">
              {bullets.map((c, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-gray-600">
                  <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${TYPE_DOT[c.type] ?? 'bg-gray-300'}`} />
                  <span>{c.summary}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="pb-4 pl-14 pr-5 pt-1 text-xs text-gray-400">Polish &amp; under-the-hood improvements.</div>
          ))}
      </div>
    </div>
  )
}

export default function ReleaseNotesPage() {
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = "What's New"
    api
      .getReleaseNotes()
      .then((d) => setReleases(d.releases || []))
      .catch(() => setReleases([]))
      .finally(() => setLoading(false))
  }, [])

  const visible = releases.filter((r) => r.changes.some((c) => VISIBLE.has(c.type)))
  const rssUrl = `${getBackendBaseUrl()}/api/release-notes/rss.xml`

  return (
    <div className="max-w-2xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">What's New</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">Changelog</h1>
          <p className="mt-2 text-gray-500">
            Every improvement we ship — newest first. Generated automatically from each deploy, no manual changelog.
          </p>
        </div>
        <a
          href={rssUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm transition-colors hover:text-gray-900"
        >
          <Rss className="h-4 w-4 text-orange-400" /> Subscribe via RSS
        </a>
      </div>

      {loading && <p className="text-gray-400">Loading…</p>}
      {!loading && visible.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-400">
          No releases yet. They'll appear here automatically on the next deploy.
        </div>
      )}

      <div>
        {visible.map((r, i) => (
          <DayEntry key={r.version} r={r} isLast={i === visible.length - 1} />
        ))}
      </div>
    </div>
  )
}
