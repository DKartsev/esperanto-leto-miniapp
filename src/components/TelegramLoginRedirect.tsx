import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './SupabaseAuthProvider';
import { findOrCreateUserProfile } from '../services/authService.js';
import LoadingScreen from './LoadingScreen';

const TelegramLoginRedirect = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { profile, loading: authLoading } = useAuth();
  const navigateRef = useRef(false);

  useEffect(() => {
    const telegramUser = window?.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!telegramUser?.id) {
      setLoading(false);
      return;
    }

    const userId = telegramUser.id.toString();
    const firstName = telegramUser.first_name;

    const initProfile = async () => {
      try {
        const uuid = await findOrCreateUserProfile(userId, telegramUser.username || firstName);
        localStorage.setItem('user_id', uuid);
        setLoading(false);
      } catch (err) {
        console.error('Ошибка входа:', err);
        setLoading(false);
      }
    };

    initProfile();
  }, [navigate]);

  useEffect(() => {
    if (
      !navigateRef.current &&
      profile &&
      !authLoading &&
      localStorage.getItem('user_id')
    ) {
      console.log('Navigate to /account', {
        telegramUser: window?.Telegram?.WebApp?.initDataUnsafe?.user,
        user_id: localStorage.getItem('user_id'),
        profile
      });
      navigateRef.current = true;
      navigate('/account');
    }
  }, [profile, authLoading, navigate]);

  if (!loading) return null;

  return (
    <LoadingScreen />
  );
};

export default TelegramLoginRedirect;
