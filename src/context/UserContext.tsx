import { createContext, useContext, useState, useEffect } from 'react';
import { useTelegramUser } from '../hooks/useTelegramUser';
import { supabase } from '../services/supabaseClient';

export const UserContext = createContext<{ userId: string | null; profile: any | null }>({
  userId: null,
  profile: null
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const telegramUser = useTelegramUser();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    async function fetchOrCreate() {
      const telegramId = telegramUser?.id || localStorage.getItem('telegram_id');
      if (!telegramId) return;

      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Ошибка при получении профиля:', error);
        return;
      }

      if (!data) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ telegram_id: telegramId, created_at: new Date().toISOString() }])
          .select()
          .single();
        if (insertError) {
          console.error('Ошибка создания профиля:', insertError);
          return;
        }
        data = newProfile;
      }

      setProfile(data);
      setUserId(data.id);
      localStorage.setItem('user_id', data.id);
      localStorage.setItem('telegram_id', String(telegramId));
    }
    fetchOrCreate();
  }, [telegramUser]);

  return <UserContext.Provider value={{ userId, profile }}>{children}</UserContext.Provider>;
};

export function useUserId() {
  return useContext(UserContext).userId;
}

export function useUserProfile() {
  return useContext(UserContext).profile;
}
