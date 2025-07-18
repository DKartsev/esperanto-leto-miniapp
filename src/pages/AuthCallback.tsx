import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient.js'

const TELEGRAM_BOT = 'EsperantoLetoBot'

const AuthCallback = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [showOpenApp, setShowOpenApp] = useState(false)

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
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)

          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) {
            console.error('setSession error:', error)
            setStatus('error')
            return
          }

          setStatus('success')
          localStorage.setItem('supabase_session_updated', Date.now().toString())

          if (window.Telegram?.WebApp?.close) {
            try {
              window.Telegram.WebApp.close()
            } catch (e) {
              console.error('Telegram close error:', e)
              setShowOpenApp(true)
            }
          } else {
            setShowOpenApp(true)
          }
        } else {
          console.error('Missing tokens in URL hash')
          setStatus('error')
          setShowOpenApp(true)
        }
      } catch (err) {
        console.error('Auth callback processing error:', err)
        setStatus('error')
        setShowOpenApp(true)
      }
    }

    handleAuth()
  }, [])

  const telegramLink = `https://t.me/${TELEGRAM_BOT}/miniapp`

  return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      {status === 'loading' && <p>⏳ Входим...</p>}
      {status === 'success' && (
        <>
          <p className="text-emerald-600 font-bold">✅ Вход выполнен</p>
          {showOpenApp && (
            <a
              href={telegramLink}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
            >
              Открыть приложение
            </a>
          )}
        </>
      )}
      {status === 'error' && (
        <>
          <p className="text-red-500">❌ Ошибка авторизации</p>
          <a
            href={telegramLink}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
          >
            Открыть приложение
          </a>
        </>
      )}
    </div>
  )
}

export default AuthCallback
