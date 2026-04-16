import { useLayoutEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { getBackendBaseUrl } from '../lib/backend-url'

function decodeJwtPayload(token: string): { everbeeStoreId?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(b64)
    return JSON.parse(json) as { everbeeStoreId?: string }
  } catch {
    return null
  }
}

/**
 * EverBee sends ?token=&store_id=&subdomain= on install and when opening the app.
 * Skip OAuth only when the JWT was issued for that same EverBee store (everbeeStoreId).
 * Demo/local sessions (e.g. demo-store-123) still go through OAuth when opened from a real store.
 */
export function EverBeeInstallRedirect() {
  const location = useLocation()
  const navigate = useNavigate()

  const installParamsPresent = useMemo(() => {
    if (location.pathname !== '/') return false
    const p = new URLSearchParams(location.search)
    return Boolean(p.get('token') && p.get('store_id') && p.get('subdomain'))
  }, [location.pathname, location.search])

  const sessionMatchesQueryStore = useMemo(() => {
    if (location.pathname !== '/') return false
    const p = new URLSearchParams(location.search)
    const queryStoreId = p.get('store_id')
    const access = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    if (!access || !queryStoreId) return false
    const payload = decodeJwtPayload(access)
    return payload?.everbeeStoreId === queryStoreId
  }, [location.pathname, location.search])

  useLayoutEffect(() => {
    if (!installParamsPresent) return

    if (sessionMatchesQueryStore) {
      navigate('/dashboard', { replace: true })
      return
    }

    const base = getBackendBaseUrl()
    const installUrl = `${base}/api/auth/install?${new URLSearchParams(location.search).toString()}`
    try {
      void new URL(installUrl)
      window.location.replace(installUrl)
    } catch {
      console.error('[EverBee] Bad backend URL — fix VITE_API_URL in Vercel to only your Railway origin.', base)
    }
  }, [installParamsPresent, sessionMatchesQueryStore, location.search, navigate])

  if (!installParamsPresent) return null

  if (sessionMatchesQueryStore) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-white text-gray-800">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      <p className="text-sm font-medium">Connecting your EverBee store…</p>
    </div>
  )
}
