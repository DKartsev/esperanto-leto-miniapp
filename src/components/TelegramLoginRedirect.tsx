import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient.js';

const TelegramLoginRedirect = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const telegramUser = window?.Telegram?.WebApp?.initDataUnsafe?.user;
    if (!telegramUser?.id) {
      setLoading(false);
      return;
    }

    const userId = telegramUser.id.toString();

    const initProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();

        if (!data) {
          await supabase.from('profiles').insert({
            id: userId,
            username: telegramUser.username,
            email: `${telegramUser.username}@telegram`,
            created_at: new Date().toISOString(),
          });
        }

        setLoading(false);
        navigate('/account');
      } catch (err) {
        console.error('Ошибка входа:', err);
        setLoading(false);
      }
    };

    initProfile();
  }, [navigate]);

  if (!loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default TelegramLoginRedirect;
