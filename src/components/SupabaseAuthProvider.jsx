import React, { createContext, useContext } from 'react'
import useAuthHook from '../hooks/useAuth.js'

// Создаем контекст для аутентификации
const SupabaseAuthContext = createContext(null)

/**
 * Провайдер аутентификации Supabase
 * @param {Object} props - Пропсы компонента
 * @param {React.ReactNode} props.children - Дочерние компоненты
 */
export function SupabaseAuthProvider({ children }) {
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
export function useAuth() {
  const context = useContext(SupabaseAuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider')
  }
  
  return context
}

export default SupabaseAuthProvider
