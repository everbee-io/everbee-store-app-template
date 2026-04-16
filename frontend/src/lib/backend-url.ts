/**
 * Resolves the backend API origin from VITE_API_URL.
 * Strips accidental paste noise (e.g. Railway CLI lines like "Service domain created: https://...").
 */
export function getBackendBaseUrl(): string {
  const fallback = 'http://localhost:3001'
  const raw = import.meta.env.VITE_API_URL?.trim()
  if (!raw) return fallback

  let s = raw
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim()
  }

  const matches = [...s.matchAll(/https?:\/\/[^\s"'<>]+/g)]
  for (let i = matches.length - 1; i >= 0; i--) {
    let candidate = matches[i][0].replace(/\/+$/, '')
    try {
      const u = new URL(candidate)
      if (u.protocol === 'http:' || u.protocol === 'https:') {
        return u.origin
      }
    } catch {
      continue
    }
  }

  try {
    const u = new URL(s)
    return u.origin
  } catch {
    if (import.meta.env.DEV) {
      console.warn(
        '[EverBee] Invalid VITE_API_URL — use only the backend origin, e.g. https://your-app.up.railway.app',
        raw
      )
    }
    return fallback
  }
}
