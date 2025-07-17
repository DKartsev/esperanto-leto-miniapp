import { createContext, useContext, type ReactNode } from 'react'
import useAuthHook from '../hooks/useSupabaseAuth.js'

// Создаем контекст для аутентификации
// Using `any` here since the hook is implemented in JavaScript
const SupabaseAuthContext = createContext<any>(null)

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
export function useAuth(): any {
  const context = useContext(SupabaseAuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider')
  }
  
  return context
}

export default SupabaseAuthProvider
