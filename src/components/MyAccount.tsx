import React, { useState } from 'react';
import { User, Shield, LogOut, Settings, Trophy, Clock, BookOpen, CheckCircle } from 'lucide-react';
import { useAuth } from './SupabaseAuthProvider.jsx';
import MagicLinkLogin from './MagicLinkLogin';

interface MyAccountProps {
  onBackToHome: () => void;
}

const MyAccount: React.FC<MyAccountProps> = ({ onBackToHome }) => {
  const { user, profile, stats, loading, signOut, isAuthenticated } = useAuth();
  const [showMagicLinkModal, setShowMagicLinkModal] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      console.log('🚪 Пользователь вышел из системы');
    } catch (error) {
      console.error('❌ Ошибка выхода:', error);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  // Функция для проверки прав администратора
  const hasAdminAccess = () => {
    return profile?.username?.toLowerCase() === 'admin5050';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Initial Login Screen
  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-emerald-200">
              {/* Header */}
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-2xl font-bold text-emerald-900 mb-2">
                Добро пожаловать!
              </h1>
              <p className="text-emerald-700 mb-8">
                Зарегистрируйтесь или войдите в систему, чтобы сохранить свой прогресс и получить персональные рекомендации
              </p>

              {/* Register Button */}
              <div className="mb-6">
                <button
                  onClick={() => setShowMagicLinkModal(true)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
                >
                  <User className="w-6 h-6" />
                  <span>Зарегистрироваться</span>
                </button>
              </div>

              {/* Security Info */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 text-emerald-700 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium text-sm">Безопасный вход</span>
                </div>
                <p className="text-xs text-emerald-600">
                  Мы используем безопасную систему входа для защиты ваших данных. 
                  Ваши данные не передаются третьим лицам.
                </p>
              </div>

              {/* Benefits */}
              <div className="text-left space-y-3">
                <h3 className="font-semibold text-emerald-900 text-center mb-4">
                  Преимущества регистрации:
                </h3>
                <div className="space-y-2">
                  {[
                    'Сохранение прогресса обучения',
                    'Персональные рекомендации',
                    'Статистика и достижения',
                    'Синхронизация между устройствами'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-emerald-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Back Button */}
              <button
                onClick={onBackToHome}
                className="mt-8 w-full text-emerald-600 hover:text-emerald-800 font-medium py-2 transition-colors"
              >
                Продолжить без регистрации
              </button>
            </div>
          </div>
        </div>

        {/* Magic Link Login */}
        <MagicLinkLogin
          isOpen={showMagicLinkModal}
          onClose={() => setShowMagicLinkModal(false)}
        />
      </>
    );
  }

  // Authenticated User Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-emerald-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-emerald-900">
                  {profile?.username || user?.email?.split('@')[0] || 'Пользователь'}
                </h1>
                <p className="text-emerald-700">
                  {user?.email}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-emerald-600 font-medium">
                    {stats?.level || 'Начинающий'}
                  </span>
                  <span className="text-emerald-400">•</span>
                  <span className="text-sm text-emerald-600">
                    С нами с {new Date(user?.created_at || '').toLocaleDateString('ru-RU')}
                  </span>
                  {/* Показываем статус администратора для admin5050 */}
                  {hasAdminAccess() && (
                    <>
                      <span className="text-emerald-400">•</span>
                      <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full font-medium">
                        👑 Администратор
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-emerald-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Выйти</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-900">
                  {stats?.completedChapters || 0}
                </div>
                <div className="text-sm text-emerald-700">Глав завершено</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-900">
                  {formatTime(stats?.totalTimeSpent || 0)}
                </div>
                <div className="text-sm text-emerald-700">Время изучения</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-900">
                  {stats?.accuracy || 0}%
                </div>
                <div className="text-sm text-emerald-700">Точность ответов</div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Access Notice for admin5050 */}
        {hasAdminAccess() && (
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-semibold">Административный доступ</h3>
                <p className="text-emerald-100">У вас есть полные права администратора</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="font-semibold">Управление контентом</div>
                <div className="text-emerald-100">Создание и редактирование глав</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="font-semibold">Пользователи</div>
                <div className="text-emerald-100">Мониторинг и управление</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="font-semibold">Аналитика</div>
                <div className="text-emerald-100">Отчеты и статистика</div>
              </div>
            </div>
            <p className="text-emerald-100 text-sm mt-4">
              💡 Используйте кнопку "Админ" в навигации для доступа к административной панели
            </p>
          </div>
        )}

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-emerald-900 mb-4">
            Общий прогресс
          </h2>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-emerald-700">Прогресс курса</span>
              <span className="text-emerald-600 font-semibold">{stats?.progress || 0}%</span>
            </div>
            <div className="w-full bg-emerald-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats?.progress || 0}%` }}
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-emerald-600">Всего ответов:</span>
              <span className="ml-2 font-semibold">{stats?.totalAnswers || 0}</span>
            </div>
            <div>
              <span className="text-emerald-600">Правильных:</span>
              <span className="ml-2 font-semibold">{stats?.correctAnswers || 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-emerald-900 mb-4">
            Последняя активность
          </h2>
          <div className="text-center py-8 text-emerald-600">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Начните изучение, чтобы увидеть свою активность здесь</p>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6">
          <h2 className="text-xl font-semibold text-emerald-900 mb-4 flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Настройки</span>
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-emerald-100">
              <span className="text-emerald-800">Уведомления о прогрессе</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-emerald-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-emerald-100">
              <span className="text-emerald-800">Ежедневные напоминания</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-emerald-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Back to Learning Button */}
        <div className="mt-8 text-center">
          <button
            onClick={onBackToHome}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Продолжить изучение
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
