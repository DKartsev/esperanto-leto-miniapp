import { createContext, useContext, type ReactNode } from 'react'
import useAuthHook from '../hooks/useSupabaseAuth.js'

// Тип для значения контекста аутентификации
export interface AuthContextValue {
  user: unknown
  profile: unknown
  stats: unknown
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<unknown>
  signUp: (email: string, password: string, username: string) => Promise<unknown>
  signOut: () => Promise<void>
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

  return (
    <SupabaseAuthContext.Provider value={auth}>
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
