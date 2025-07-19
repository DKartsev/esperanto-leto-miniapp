import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient.js';
import { useAuth } from './SupabaseAuthProvider';

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
        const { data } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('id', userId)
          .maybeSingle();

        if (!data) {
          await supabase.from('profiles').insert({
            id: userId,
            username: firstName,
            email: `${userId}@telegram`,
            telegram_id: userId,
            created_at: new Date().toISOString(),
          });
        } else if (!data.username) {
          await supabase
            .from('profiles')
            .update({ username: firstName })
            .eq('id', userId);
        }

        localStorage.setItem('user_id', userId);
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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default TelegramLoginRedirect;
