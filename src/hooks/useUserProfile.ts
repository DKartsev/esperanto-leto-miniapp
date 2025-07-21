import { useEffect, useState } from 'react'
import { useAuth } from '../components/SupabaseAuthProvider'
import { getUserProfile, findOrCreateUserProfile } from '../services/authService'

export interface UserProfile {
  id: string
  [key: string]: any
}

const useUserProfile = (userId?: string | null) => {
  const { user, profile: authProfile, updateProfile } = useAuth() as any
  const [resolvedId, setResolvedId] = useState<string | null>(
    userId || user?.id || localStorage.getItem('user_id') || null
  )
  const [profile, setProfile] = useState<UserProfile | null>(
    authProfile && (!userId || authProfile?.id === resolvedId) ? authProfile : null
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const resolve = async () => {
      const id = userId || user?.id || localStorage.getItem('user_id')
      if (!id) {
        setResolvedId(null)
        return
      }
      if (/^\d+$/.test(String(id))) {
        const username = window.Telegram?.WebApp?.initDataUnsafe?.user?.username || null
        const uuid = await findOrCreateUserProfile(String(id), username)
        setResolvedId(uuid)
      } else {
        setResolvedId(id)
      }
    }
    void resolve()
  }, [userId, user])

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
