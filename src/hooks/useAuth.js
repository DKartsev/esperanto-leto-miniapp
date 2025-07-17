import { useState, useEffect } from 'react'
import { 
  getCurrentUser, 
  getUserProfile, 
  onAuthStateChange,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut
} from '../services/authService.js'
import { getUserStats } from '../services/progressService.js'

/**
 * Хук для работы с аутентификацией Supabase
 * @returns {Object} Объект с состоянием аутентификации и методами
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Загрузка данных пользователя
  const loadUserData = async (currentUser) => {
    if (!currentUser) {
      setUser(null)
      setProfile(null)
      setStats(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Загружаем профиль и статистику параллельно
      const [userProfile, userStats] = await Promise.all([
        getUserProfile(currentUser.id),
        getUserStats()
      ])

      setUser(currentUser)
      setProfile(userProfile)
      setStats(userStats)
    } catch (err) {
      console.error('Ошибка загрузки данных пользователя:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Инициализация при монтировании
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (mounted) {
          await loadUserData(currentUser)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    initAuth()

    // Подписка на изменения аутентификации
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      
      if (mounted) {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setStats(null)
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Методы аутентификации
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await authSignIn(email, password)
      
      // Данные пользователя загрузятся автоматически через onAuthStateChange
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email, password, username) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await authSignUp(email, password, username)
      
      // Данные пользователя загрузятся автоматически через onAuthStateChange
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      
      await authSignOut()
      
      // Состояние очистится автоматически через onAuthStateChange
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
      const userStats = await getUserStats()
      setStats(userStats)
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
    loading: isLoading,
    error,
    isAuthenticated,

    // Методы
    signIn,
    signUp,
    signOut,
    refreshStats,
    
    // Утилиты
    clearError: () => setError(null)
  }
}

export default useAuth
