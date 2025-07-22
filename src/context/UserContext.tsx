import { createContext, useContext, useState, useEffect } from 'react';
import { useTelegramUser } from '../hooks/useTelegramUser';
import { syncTelegramProfile } from '../services/syncTelegramProfile';

export const UserContext = createContext<{ userId: string | null }>({ userId: null });

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const telegramUser = useTelegramUser();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrCreate() {
      if (telegramUser) {
        const profile = await syncTelegramProfile(telegramUser);
        if (profile?.id) {
          setUserId(profile.id);
          localStorage.setItem('user_id', profile.id); // optional fallback
        }
      }
    }
    fetchOrCreate();
  }, [telegramUser]);

  return <UserContext.Provider value={{ userId }}>{children}</UserContext.Provider>;
};

export function useUserId() {
  return useContext(UserContext).userId;
}
