import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient.js'

const AuthCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash
      const query = new URLSearchParams(hash.substring(1))
      const access_token = query.get('access_token')
      const refresh_token = query.get('refresh_token')

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })
        if (error) {
          console.error(error)
          setStatus('error')
        } else {
          setStatus('success')
          if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close()
          }
        }
      } else {
        setStatus('error')
      }
    }

    handleAuth()
  }, [])

  return (
    <div className="h-screen flex items-center justify-center">
      {status === 'loading' && <p>⏳ Входим...</p>}
      {status === 'success' && <p className="text-emerald-600 font-bold">✅ Вход выполнен</p>}
      {status === 'error' && <p className="text-red-500">❌ Ошибка авторизации</p>}
    </div>
  )
}

export default AuthCallback;
