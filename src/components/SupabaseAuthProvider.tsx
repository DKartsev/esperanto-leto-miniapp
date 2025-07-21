import { createContext, useContext, type ReactNode } from 'react'
import useAuthHook, {
  type AuthUser,
  type UserProfile,
  type UserStats,
} from '../hooks/useSupabaseAuth'

// Тип для значения контекста аутентификации
export interface AuthContextValue {
  user: AuthUser | null
  profile: UserProfile | null
  stats: UserStats | null
  achievements: any[]
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  updateProfile: (updates: Record<string, any>) => Promise<UserProfile | null>
  refreshStats: () => Promise<void>
  clearError: () => void
}

// Создаем контекст для аутентификации
const SupabaseAuthContext = createContext<AuthContextValue | null>(null)

/**
 * Провайдер аутентификации Supabase
 * @param {Object} props - Пропсы компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 */
export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook()

  const isAdmin = Boolean(auth.profile?.is_admin)
  const value: AuthContextValue = { ...auth, isAdmin }

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}

/**
 * Хук для использования контекста аутентификации
 * @returns {Object} Объект с методами и состоянием аутентификации
 */
export function useAuth(): AuthContextValue {
  const context = useContext(SupabaseAuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider')
  }
  
  return context
}

export default SupabaseAuthProvider
