import { useState, useEffect } from 'react'
import {
  getUserProfile,
  updateUserProfile as authUpdateUserProfile,
  signOut as authSignOut
} from '../services/authService'
import { supabase } from '../services/supabaseClient'
import { getUserStats, getUserAchievements } from '../services/progressService'

/**
 * Хук для работы с аутентификацией Supabase
 * @returns {Object} Объект с состоянием аутентификации и методами
 */
export function useSupabaseAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Загрузка данных пользователя по telegram_id
  const loadUserData = async (identifier) => {
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
        .single()

      if (profileError) throw profileError

      const [userStats, userAchievements] = await Promise.all([
        getUserStats(userProfile.id),
        getUserAchievements(userProfile.id)
      ])

      setUser({ id: identifier })
      setProfile(userProfile)
      setStats(userStats)
      setAchievements(userAchievements)
    } catch (err) {
      console.error('Ошибка загрузки данных пользователя:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Инициализация при монтировании
  useEffect(() => {
    const storedTelegramId = localStorage.getItem('user_id')
    if (storedTelegramId) {
      loadUserData(storedTelegramId)
    }
  }, [])

  // Telegram-only аутентификация
  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      await authSignOut()
      setUser(null)
      setProfile(null)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return null
    try {
      setLoading(true)
      setError(null)

      const updated = await authUpdateUserProfile(user.id, updates)
      setProfile(updated)
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Обновление статистики
  const refreshStats = async () => {
    if (!user) return

    try {
      const [userStats, userAchievements] = await Promise.all([
        getUserStats(),
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
  }
}

export default useSupabaseAuth
