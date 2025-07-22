import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../components/SupabaseAuthProvider'
import { getUserProfile, findOrCreateUserProfile } from '../services/authService'
import { getTelegramUser } from '../utils/telegram'

export interface UserProfile {
  id: string
  [key: string]: any
}

const useUserProfile = (userId?: string | null) => {
  const { user, profile: authProfile, updateProfile } = useAuth()
  const resolved = userId || user?.id || localStorage.getItem('user_id') || null

  const query = useQuery({
    queryKey: ['user-profile', resolved],
    queryFn: async () => {
      if (!resolved) return null
      let finalId = resolved
      if (/^\d+$/.test(String(resolved))) {
        const tgUser = getTelegramUser()
        finalId = await findOrCreateUserProfile(
          String(resolved),
          tgUser?.username || null,
          tgUser?.first_name || null,
          tgUser?.last_name || null
        )
      }
      if (authProfile && authProfile.id === finalId) {
        return authProfile as UserProfile
      }
      const data = await getUserProfile(finalId)
      return data as UserProfile
    },
    enabled: !!resolved,
    initialData:
      authProfile && (!userId || authProfile.id === resolved)
        ? (authProfile as UserProfile)
        : undefined,
    staleTime: 60 * 1000
  })

  return { userId: resolved, profile: query.data ?? null, loading: query.isLoading, updateProfile }
}

export default useUserProfile
