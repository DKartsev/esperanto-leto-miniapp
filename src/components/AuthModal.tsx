import { useState, type FormEvent } from 'react'
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import LoadingScreen from './LoadingScreen'
import { useAuth } from './SupabaseAuthProvider'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

/**
 * Модальное окно для аутентификации
 * @param {Object} props - Пропсы компонента
 * @param {boolean} props.isOpen - Открыто ли модальное окно
 * @param {Function} props.onClose - Функция закрытия модального окна
 * @param {string} props.defaultMode - Режим по умолчанию ('signin' или 'signup')
 */
export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const mode = 'signin'
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const { signIn, loading, error, clearError } = useAuth()

  // Сброс формы при закрытии
  const handleClose = () => {
    setFormData({ email: '', password: '' })
    setFormErrors({})
    clearError()
    onClose()
  }

  // Обработка изменения полей формы
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Очищаем ошибку для этого поля
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Очищаем общую ошибку
    if (error) {
      clearError()
    }
  }

  // Валидация формы
  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    // Проверка email
    if (!formData.email) {
      errors.email = 'Email обязателен'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Некорректный email'
    }

    // Проверка пароля
    if (!formData.password) {
      errors.password = 'Пароль обязателен'
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов'
    }

    // Дополнительные проверки отсутствуют

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Обработка отправки формы
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await signIn(formData.email, formData.password)
      
      // Закрываем модальное окно при успешной аутентификации
      handleClose()
    } catch (err) {
      // Ошибка уже обработана в хуке useAuth
      console.error('Authentication error:', err)
    }
  }

  // Переключение режима

  if (!isOpen) return null
  if (loading) return <LoadingScreen />

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-emerald-900">
            {mode === 'signin' ? 'Вход в систему' : 'Регистрация'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  formErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>
            {formErrors.email && (
              <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
            )}
          </div>


          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  formErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ваш пароль"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
            )}
          </div>


          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            Войти
          </button>

        </form>
      </div>
    </div>
  )
}

export default AuthModal
