import { createContext, useContext, type ReactNode } from 'react'
import useAuthHook from '../hooks/useSupabaseAuth.js'

// Тип для значения контекста аутентификации
export interface AuthContextValue {
  user: unknown
  profile: unknown
  stats: unknown
  achievements: unknown[]
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<unknown>
  signOut: () => Promise<void>
  updateProfile: (updates: Record<string, unknown>) => Promise<unknown>
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
  const auth = useAuthHook() as unknown as Omit<AuthContextValue, 'isAdmin'> & {
    profile: { is_admin?: boolean }
  }

  const isAdmin = Boolean(auth.profile?.is_admin)
  const value = { ...auth, isAdmin } as AuthContextValue

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
