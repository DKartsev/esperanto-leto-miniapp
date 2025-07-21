import { useState, useEffect } from 'react'
import {
  updateUserProfile as authUpdateUserProfile,
  signOut as authSignOut,
  findOrCreateUserProfile
} from '../services/authService'
import { getTelegramUser } from '../utils/telegram'
import { supabase } from '../services/supabaseClient'
import { getUserStats, getUserAchievements } from '../services/progressService'

export interface AuthUser {
  id: string
  email?: string | null
}

export interface UserProfile {
  id: string
  username: string | null
  telegram_id: string | null
  is_admin?: boolean
  [key: string]: any
}

export interface UserStats {
  totalAnswers: number
  correctAnswers: number
  accuracy: number
  totalTimeSpent: number
  totalHintsUsed: number
  averageTimePerQuestion: number
  completedSections: number
  completedChapters: number
  level: string
  progress: number
}

export interface UseSupabaseAuthResult {
  user: AuthUser | null
  profile: UserProfile | null
  stats: UserStats | null
  achievements: any[]
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  signOut: () => Promise<void>
  updateProfile: (updates: Record<string, any>) => Promise<UserProfile | null>
  refreshStats: () => Promise<void>
  clearError: () => void
}

/**
 * Хук для работы с аутентификацией Supabase
 * @returns {Object} Объект с состоянием аутентификации и методами
 */
export function useSupabaseAuth(): UseSupabaseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загрузка данных пользователя по telegram_id
  const loadUserData = async (identifier: string | null) => {
    if (!identifier) {
      setUser(null)
      setProfile(null)
      setStats(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Загружаем профиль по telegram_id
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, telegram_id')
        .eq('telegram_id', identifier)
        .single<UserProfile>()

      if (profileError) throw profileError

        const [userStats, userAchievements] = await Promise.all([
          getUserStats() as Promise<UserStats>,
          getUserAchievements()
        ])

      setUser({ id: identifier })
      setProfile(userProfile)
      setStats(userStats)
      setAchievements(userAchievements)
    } catch (err) {
      console.error('Ошибка загрузки данных пользователя:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  // Инициализация при монтировании через Telegram WebApp
  useEffect(() => {
    const init = async () => {
      const tgUser = getTelegramUser()
      if (!tgUser) {
        setLoading(false)
        return
      }

      try {
        const uuid = await findOrCreateUserProfile(
          String(tgUser.id),
          tgUser.username || tgUser.first_name || null
        )
        if (uuid) {
          localStorage.setItem('user_id', uuid)
        }
        localStorage.setItem('telegram_id', String(tgUser.id))
        await loadUserData(String(tgUser.id))
      } catch (err) {
        console.error('Ошибка инициализации пользователя:', err)
        setError(err instanceof Error ? err.message : String(err))
        setLoading(false)
      }
    }

    void init()
  }, [])

  // Telegram-only аутентификация
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      await authSignOut()
      setUser(null)
      setProfile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (
    updates: Record<string, any>
  ): Promise<UserProfile | null> => {
    if (!user) return null
    try {
      setLoading(true)
      setError(null)

      const updated = (await authUpdateUserProfile(
        user.id,
        updates
      )) as UserProfile
      setProfile(updated)
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Обновление статистики
  const refreshStats = async (): Promise<void> => {
    if (!user) return

    try {
      const [userStats, userAchievements] = await Promise.all([
        getUserStats() as Promise<UserStats>,
        getUserAchievements()
      ])
      setStats(userStats)
      setAchievements(userAchievements)
    } catch (err) {
      console.error('Ошибка обновления статистики:', err)
    }
  }

  // Проверка аутентификации
  const isAuthenticated = !!user
  const isLoading = loading

  return {
    // Состояние
    user,
    profile,
    stats,
    achievements,
    loading: isLoading,
    error,
    isAuthenticated,

    // Методы
    signOut,
    updateProfile,
    refreshStats,
    
    // Утилиты
    clearError: () => setError(null)
  } as UseSupabaseAuthResult
}

export default useSupabaseAuth
