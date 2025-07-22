import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../components/SupabaseAuthProvider'
import { getUserProfile, findOrCreateUserProfile } from '../services/authService'
import { getTelegramUser } from '../utils/telegram'

export interface UserProfile {
  id: string
  [key: string]: any
}

export interface UseUserProfileResult {
  userId: string | null
  data: UserProfile | null
  isLoading: boolean
  isError: boolean
  updateProfile: (updates: Record<string, any>) => Promise<UserProfile | null>
}

const useUserProfile = (userId: string | null): UseUserProfileResult => {
  const { user, profile: authProfile, updateProfile } = useAuth()
  const resolved = userId ?? user?.id ?? localStorage.getItem('user_id') ?? null

  const query = useQuery<UserProfile>({
    queryKey: ['user-profile', resolved],
    queryFn: async () => {
      if (!resolved) {
        throw new Error('userId is required')
      }
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

  return {
    userId: resolved,
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    updateProfile
  }
}

export default useUserProfile
