import React, { useState } from 'react'
import { X, Mail, Loader } from 'lucide-react'
import { supabase } from '../services/supabaseClient.js'

interface MagicLinkLoginProps {
  isOpen: boolean
  onClose: () => void
}

const MagicLinkLogin: React.FC<MagicLinkLoginProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError('')

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Некорректный email')
      return
    }

    try {
      setLoading(true)
      const redirectTo =
        window.location.hostname === 'localhost'
          ? 'http://localhost:3000/auth/callback'
          : 'https://tgminiapp.esperanto-leto.ru/auth/callback'

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo }
      })
      if (signInError) throw signInError
      setSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message || 'Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-emerald-900">Вход по ссылке</h2>
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {loading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'Send Magic Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default MagicLinkLogin
