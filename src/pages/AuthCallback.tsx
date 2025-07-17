import { useEffect, useState, type FC } from 'react';
import { supabase } from '../services/supabaseClient.js';

const AuthCallback: FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash;
      const query = new URLSearchParams(hash.substring(1));
      const access_token = query.get('access_token');
      const refresh_token = query.get('refresh_token');

      if (!access_token || !refresh_token) {
        setStatus('error');
        return;
      }

      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        return;
      }

      setStatus('success');
      setTimeout(() => {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.close) {
          window.Telegram.WebApp.close();
        } else {
          window.location.replace('/');
        }
      }, 1500);
    };

    handleAuth();
  }, []);

  let message = 'Вход...';
  if (status === 'success') message = 'Вход выполнен успешно';
  if (status === 'error') message = 'Ошибка авторизации';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        )}
        <p className="text-emerald-700">{message}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
