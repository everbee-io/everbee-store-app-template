/**
 * Route guard: EverBee team only.
 *
 * Wraps routes that should be visible ONLY to EverBee staff (users with an
 * `@everbee.io` email) — e.g. the internal How It Works page. Regular sellers are
 * redirected to the dashboard. While the user loads, render nothing to avoid a
 * flash of gated content.
 */
import { Navigate, Outlet } from 'react-router-dom'
import { useCurrentUser } from '../hooks/useCurrentUser'

export default function EverbeeTeamRoute() {
  const { isEverbeeTeam, isLoading } = useCurrentUser()

  if (isLoading) return null
  if (!isEverbeeTeam) return <Navigate to="/dashboard" replace />

  return <Outlet />
}
