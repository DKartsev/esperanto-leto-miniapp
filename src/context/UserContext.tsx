import { createContext, useContext, useState, useEffect } from 'react';
import { useTelegramUser } from '../hooks/useTelegramUser';
import { supabase } from '../services/supabaseClient';
import { syncTelegramProfile } from '../services/syncTelegramProfile';

export interface Profile {
  id: string
  username?: string | null
  telegram_id?: string | null
  [key: string]: any
}

export const UserContext = createContext<{ userId: string | null; profile: Profile | null }>({
  userId: null,
  profile: null
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const telegramUser = useTelegramUser();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (telegramUser) {
        const data = await syncTelegramProfile(telegramUser);
        if (data) {
          setProfile(data);
          setUserId(data.id);
          localStorage.setItem('user_id', data.id);
          localStorage.setItem('telegram_id', String(data.telegram_id));
          return;
        }
      }

      const storedId = localStorage.getItem('telegram_id');
      if (!storedId) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', storedId)
        .single();

      if (error) {
        console.error('Ошибка при получении профиля:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setUserId(data.id);
      }
    }

    fetchProfile();
  }, [telegramUser]);

  return <UserContext.Provider value={{ userId, profile }}>{children}</UserContext.Provider>;
};

export function useUserId() {
  return useContext(UserContext).userId;
}

export function useUserProfile() {
  return useContext(UserContext).profile;
}
