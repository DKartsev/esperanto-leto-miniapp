import { useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Mail } from 'lucide-react'
import LoadingVideo from './LoadingVideo'
import { supabase } from '../services/supabaseClient.js'
import { ADMIN_EMAIL } from '../utils/adminUtils.js'

const EMAIL_REDIRECT = 'https://tgminiapp.esperanto-leto.ru/auth/callback'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD

export interface MagicLinkLoginProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  buttonLabel?: string
}
const MagicLinkLogin: FC<MagicLinkLoginProps> = ({
  isOpen,
  onClose,
  title = 'Вход по ссылке',
  buttonLabel = 'Отправить ссылку',
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Некорректный email')
      return
    }
    try {
      setLoading(true)

      if (email === ADMIN_EMAIL) {
        if (password !== ADMIN_PASSWORD) {
          setError('Неверный пароль')
          return
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        })

        if (error) {
          setError('Ошибка входа администратора')
        } else {
          navigate('/admin-panel')
        }

        return
      }

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: EMAIL_REDIRECT,
        },
      })

      if (signInError) {
        setError('Ошибка отправки ссылки для входа')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message || 'Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null
  if (loading) return <LoadingVideo />

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-emerald-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {success ? (
          <p className="text-center text-emerald-700 font-semibold">Письмо отправлено</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>
            {email === ADMIN_EMAIL && (
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Введите пароль администратора"
                className="input"
              />
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {buttonLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default MagicLinkLogin
