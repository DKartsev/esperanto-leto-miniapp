import { FC, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Shield, LogOut, Check } from 'lucide-react'
import { useAuth } from './SupabaseAuthProvider'
import { isAdmin } from '../utils/adminUtils.js'
import { findOrCreateUserProfile } from '../services/authService.js'
import LoadingScreen from './LoadingScreen'
import AdminPanelButton from './AdminPanelButton'
import AccountHeader from './account/AccountHeader'
import AccountStats from './account/AccountStats'
import AccountProgress from './account/AccountProgress'
import SectionProgressList from './account/SectionProgressList'
import SummaryCards from './account/SummaryCards'
import useChapterStats from '../hooks/useChapterStats'
import useUserProgress from '../hooks/useUserProgress'
import { formatHoursMinutes } from '../utils/formatTime'

interface MyAccountProps {
  onBackToHome: () => void
  onStartChapter?: (chapterId: number) => void
}

const MyAccount: FC<MyAccountProps> = ({ onBackToHome, onStartChapter }) => {
  const {
    user,
    profile,
    stats,
    achievements,
    loading,
    signOut,
    isAuthenticated,
    updateProfile,
  } = useAuth() as any

  const navigate = useNavigate()

  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState(profile?.username || '')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const userId = user?.id || localStorage.getItem('user_id')

  const chapterStats = useChapterStats(userId)
  const {
    progressLoading,
    startDate,
    completedChapters,
    totalStudyMinutes,
    averageAccuracy,
    chapterProgress,
    recommendedChapter,
    progressData
  } = useUserProgress(userId)

  useEffect(() => {
    setNewUsername(profile?.username || '')
  }, [profile])

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('❌ Ошибка выхода:', error)
    }
  }

  const handleUsernameSave = async () => {
    try {
      if (!newUsername || newUsername === profile?.username) {
        setIsEditingUsername(false)
        return
      }
      await updateProfile({ username: newUsername })
      setIsEditingUsername(false)
    } catch (error) {
      console.error('Ошибка обновления имени пользователя:', error)
    }
  }

  const handleUsernameCancel = () => {
    setNewUsername(profile?.username || '')
    setIsEditingUsername(false)
  }

  const handleTelegramLogin = async () => {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
    if (!tgUser) {
      console.warn('Пользователь Telegram не найден')
      setLoginError('Пользователь Telegram не найден')
      return
    }

    setLoginLoading(true)
    const username = tgUser.username || `${tgUser.first_name}${tgUser.last_name || ''}`
    const userId = await findOrCreateUserProfile(tgUser.id.toString(), username)

    if (!userId) {
      setLoginError('Ошибка создания профиля')
      return
    }

    // ✅ сохраняем telegram_id
    localStorage.setItem('user_id', tgUser.id.toString())

    navigate('/')
  }

  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user

  useEffect(() => {
    if (!isAuthenticated && telegramUser) {
      handleTelegramLogin()
    }
  }, [isAuthenticated, telegramUser])

  const navigateRef = useRef(false)
  useEffect(() => {
    if (!navigateRef.current && telegramUser && localStorage.getItem('user_id') && profile && !loading) {
      navigateRef.current = true
      navigate('/account')
    }
  }, [telegramUser, profile, loading, navigate])

  const hasAdminAccess = () => isAdmin(profile?.username, user?.email)

  if (loading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    if (loginLoading) {
      return <LoadingScreen />
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-emerald-200">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-900 mb-2">Добро пожаловать!</h1>
            <p className="text-emerald-700 mb-8">Вы авторизуетесь через Telegram для сохранения прогресса и рекомендаций</p>
            {loginError && <p className="text-red-600 mb-4">{loginError}</p>}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 text-emerald-700 mb-2">
                <Shield className="w-5 h-5" />
                <span className="font-medium text-sm">Безопасный вход</span>
              </div>
              <p className="text-xs text-emerald-600">Мы используем безопасную систему входа для защиты ваших данных. Ваши данные не передаются третьим лицам.</p>
            </div>
            <div className="text-left space-y-3">
              <h3 className="font-semibold text-emerald-900 text-center mb-4">Преимущества регистрации:</h3>
              <div className="space-y-2">
                {['Сохранение прогресса обучения','Персональные рекомендации','Статистика и достижения','Синхронизация между устройствами'].map((b,i)=>(
                  <div key={i} className="flex items-center space-x-2 text-sm text-emerald-700">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={onBackToHome} className="mt-8 w-full text-emerald-600 hover:text-emerald-800 font-medium py-2 transition-colors">Продолжить без регистрации</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="bg-white shadow-sm border-b border-emerald-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <AccountHeader
              username={profile?.username || user?.email?.split('@')[0] || 'Пользователь'}
              email={user?.email}
              isEditing={isEditingUsername}
              newUsername={newUsername}
              onEdit={() => setIsEditingUsername(true)}
              onChange={setNewUsername}
              onSave={handleUsernameSave}
              onCancel={handleUsernameCancel}
            />
            <button onClick={handleLogout} className="flex items-center space-x-2 text-emerald-600 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Выйти</span>
            </button>
          </div>
          {chapterStats && <AccountStats {...chapterStats} />}
        </div>
      </div>
      <div className="p-6">
        <SummaryCards stats={stats} startDate={startDate} />
        {progressLoading ? (
          <div className="rounded-2xl p-4 bg-white shadow my-4" />
        ) : (
          <div className="rounded-2xl p-4 bg-white shadow my-4 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-600">Глав завершено: {completedChapters}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-600">Обучение: {formatHoursMinutes(totalStudyMinutes)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-emerald-600">Точность ответов: {averageAccuracy}%</span>
            </div>
          </div>
        )}
        {achievements && achievements.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Достижения
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              {achievements.map((a: any, idx: number) => (
                <li key={idx} className="text-yellow-700">{a.achievement_type}</li>
              ))}
            </ul>
          </div>
        )}
        {progressData && progressData.length > 0 && (
          <SectionProgressList progress={progressData} />
        )}
        {chapterProgress && chapterProgress.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-6">
            {recommendedChapter ? (
              <div className="mb-4 flex justify-between items-center">
                <span className="text-emerald-700">Рекомендуем начать с главы: <span className="font-semibold">{recommendedChapter.title}</span></span>
                {onStartChapter && (
                  <button onClick={() => onStartChapter(recommendedChapter.chapterId)} className="bg-emerald-600 text-white text-sm px-3 py-1 rounded-lg hover:bg-emerald-700">Начать обучение</button>
                )}
              </div>
            ) : (
              <div className="mb-4 text-emerald-700">Вы прошли все главы 🎉</div>
            )}
            <AccountProgress progress={chapterProgress} onStart={onStartChapter} />
          </div>
        )}
        <div className="mt-8 text-center">
          {hasAdminAccess() && <AdminPanelButton />}
          <button onClick={onBackToHome} className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">Продолжить изучение</button>
        </div>
      </div>
    </div>
  )
}

export default MyAccount
