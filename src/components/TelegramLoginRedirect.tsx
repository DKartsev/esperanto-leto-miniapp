import { useEffect, useState, useRef } from 'react';
import { useAuth } from './SupabaseAuthProvider';
import { findOrCreateUserProfile } from '../services/authService';
import { getTelegramUser } from '../utils/telegram';
import LoadingScreen from './LoadingScreen';

const TelegramLoginRedirect = () => {
  const [loading, setLoading] = useState(true);
  const { profile, loading: authLoading } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    window.Telegram?.WebApp?.ready();
    const telegramUser = getTelegramUser();
    if (!telegramUser) {
      setLoading(false);
      return;
    }

    const userId = telegramUser.id.toString();

    const initProfile = async () => {
      try {
        const uuid = await findOrCreateUserProfile(
          userId,
          telegramUser.username ?? null,
          telegramUser.first_name ?? null,
          telegramUser.last_name ?? null
        );
        if (uuid) {
          localStorage.setItem('user_id', uuid);
        }
        setLoading(false);
      } catch (err) {
        console.error('Ошибка входа:', err);
        setLoading(false);
      }
    };

    initProfile();
  }, []);

  useEffect(() => {
    if (
      !processedRef.current &&
      profile &&
      !authLoading &&
      localStorage.getItem('user_id')
    ) {
      console.log('Profile ready', {
        telegramUser: getTelegramUser(),
        user_id: localStorage.getItem('user_id'),
        profile
      });
      processedRef.current = true;
    }
  }, [profile, authLoading]);

  if (!loading) return <p className="text-center text-gray-400">Контент загружается...</p>;

  return (
    <LoadingScreen />
  );
};

export default TelegramLoginRedirect;
