import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient.js'

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

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setUser(session?.user ?? null)
      }
    })

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
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
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
