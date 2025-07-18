import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient.js'

const AuthCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const hash = window.location.hash
        console.log('Auth callback hash:', hash)

        const params = new URLSearchParams(hash.replace(/^#/, ''))
        const access_token = params.get('access_token') || ''
        const refresh_token = params.get('refresh_token') || ''
        console.log('Parsed tokens:', { access_token, refresh_token })

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) {
            console.error('setSession error:', error)
            setStatus('error')
            return
          }

          setStatus('success')
          localStorage.setItem('supabase_session_updated', Date.now().toString())

          const closeApp = () => {
            if (window.Telegram?.WebApp?.close) {
              window.Telegram.WebApp.close()
            } else {
              window.close()
            }
          }
          setTimeout(closeApp, 1000)
        } else {
          console.error('Missing tokens in URL hash')
          setStatus('error')
        }
      } catch (err) {
        console.error('Auth callback processing error:', err)
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

export default AuthCallback
