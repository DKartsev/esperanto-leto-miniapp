import React, { useState } from 'react';
import {
  User,
  Shield,
  LogOut,
  Settings,
  Trophy,
  Clock,
  BookOpen,
  CheckCircle
} from 'lucide-react';
import { useAuth } from './SupabaseAuthProvider.jsx';
import AuthModal from './AuthModal.jsx';

interface MyAccountProps {
  onBackToHome: () => void;
}

const MyAccount: React.FC<MyAccountProps> = ({ onBackToHome }) => {
  const { user, profile, stats, loading, signOut, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
  };

  const hasAdminAccess = () => profile?.username?.toLowerCase() === 'admin5050';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8 border border-emerald-200">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-900 mb-2">Добро пожаловать!</h1>
            <p className="text-emerald-700 mb-8">
              Зарегистрируйтесь или войдите в систему, чтобы сохранить свой прогресс и получить персональные рекомендации
            </p>
            <button onClick={() => setShowAuthModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all w-full flex justify-center items-center gap-2">
              <User className="w-6 h-6" />
              Зарегистрироваться
            </button>
            <div className="mt-6 text-left text-sm text-emerald-700">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Безопасный вход</span>
              </div>
              <p className="mt-1 text-xs text-emerald-600">
                Мы используем безопасную систему входа для защиты ваших данных. Ваши данные не передаются третьим лицам.
              </p>
            </div>
            <div className="mt-6 text-left space-y-2">
              <h3 className="text-center font-semibold text-emerald-900">Преимущества регистрации:</h3>
              {["Сохранение прогресса обучения", "Персональные рекомендации", "Статистика и достижения", "Синхронизация между устройствами"].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-emerald-700 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <button
              onClick={onBackToHome}
              className="mt-8 text-emerald-600 border border-emerald-400 px-4 py-2 rounded-xl text-sm hover:bg-green-50 transition-all w-full"
            >
              Продолжить без регистрации
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode="signup"
        />
      </>
    );
  }

  return <div className="min-h-screen bg-green-50">Вы вошли!</div>;
};

export default MyAccount;
