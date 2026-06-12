/**
 * Current user + team gating.
 *
 * `isEverbeeTeam` is true only when the signed-in user has an `@everbee.io`
 * email. Use it to hide internal/team-only surfaces (e.g. the How It Works page)
 * from regular sellers. The same check is the basis for any "EverBee staff only"
 * gate in the app.
 */
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api-client'

export type CurrentUser = {
  id: string
  email: string
  name?: string
  role?: string
  store?: { id: string; storeId: string; subdomain: string; storeName?: string }
}

const EVERBEE_DOMAIN = '@everbee.io'

export function isEverbeeEmail(email?: string | null): boolean {
  return !!email && email.toLowerCase().trim().endsWith(EVERBEE_DOMAIN)
}

export function useCurrentUser() {
  const query = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const data = await api.getCurrentUser()
      return (data.user ?? null) as CurrentUser | null
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isEverbeeTeam: isEverbeeEmail(query.data?.email),
  }
}
