import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient.js'

const EMAIL_REDIRECT = 'https://tgminiapp.esperanto-leto.ru/auth/callback'

/**
 * Hook for Supabase email OTP authentication
 */
export default function useAuth() {
  const [user, setUser] = useState(null)
  const [emailSent, setEmailSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Subscribe to auth changes and restore session on mount
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (mounted) {
        setUser(session?.user ?? null)
      }

      if (!session) {
        const access_token = localStorage.getItem('access_token')
        const refresh_token = localStorage.getItem('refresh_token')
        if (access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) {
            console.error('Restore session error:', error)
          } else if (mounted) {
            setUser(data.session?.user ?? null)
          }
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  // Sign in via magic link (OTP)
  const signInWithEmail = async (email) => {
    try {
      setLoading(true)
      setError(null)
      setEmailSent(false)

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: EMAIL_REDIRECT
        }
      })

      if (error) throw error

      setEmailSent(true)
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
      await supabase.auth.signOut()
      setUser(null)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    emailSent,
    loading,
    error,
    signInWithEmail,
    signOut,
    clearError: () => setError(null)
  }
}
