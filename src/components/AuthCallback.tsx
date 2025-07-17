import { useEffect, type FC } from 'react';
import { supabase } from '../services/supabaseClient.js';

const AuthCallback: FC = () => {
  useEffect(() => {
    const handleAuth = async () => {
      try {
        await supabase.auth.exchangeCodeForSession(window.location.href);
      } catch (error) {
        console.error('Auth callback error:', error);
      } finally {
        window.location.replace('/');
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-emerald-700">Подождите...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
