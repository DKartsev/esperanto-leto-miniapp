import { useEffect, useState } from 'react'
import { useAuth } from '../components/SupabaseAuthProvider'
import { getUserProfile } from '../services/authService.js'

export interface UserProfile {
  id: string
  [key: string]: any
}

const useUserProfile = (userId?: string | null) => {
  const { user, profile: authProfile, updateProfile } = useAuth() as any
  const resolvedId = userId || user?.id || localStorage.getItem('user_id') || null
  const [profile, setProfile] = useState<UserProfile | null>(
    authProfile && (!userId || authProfile?.id === resolvedId) ? authProfile : null
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!resolvedId) {
        setProfile(null)
        return
      }
      if (authProfile && authProfile.id === resolvedId) {
        setProfile(authProfile)
        return
      }
      setLoading(true)
      const data = await getUserProfile(resolvedId)
      setProfile(data as any)
      setLoading(false)
    }
    void load()
  }, [resolvedId, authProfile])

  return { userId: resolvedId, profile, loading, updateProfile }
}

export default useUserProfile
