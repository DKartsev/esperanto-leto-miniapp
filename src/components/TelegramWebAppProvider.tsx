import { createContext, useContext, useEffect, useState, useRef, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { telegramWebApp } from '../services/telegramWebApp';
import { telegramLogin } from '../services/telegramAuth';
import { useAuth } from './SupabaseAuthProvider';

interface TelegramWebAppContextType {
  isAvailable: boolean;
  user: unknown;
  isDarkTheme: boolean;
  themeParams: Record<string, unknown>;
  sendData: (data: unknown) => void;
  showAlert: (message: string) => Promise<void>;
  showConfirm: (message: string) => Promise<boolean>;
  hapticFeedback: (type: 'impact' | 'notification' | 'selection', style?: string) => void;
  setMainButton: (params: Record<string, unknown>) => void;
  hideMainButton: () => void;
  showBackButton: () => void;
  hideBackButton: () => void;
  openTelegramLink: (url: string) => void;
}

const TelegramWebAppContext = createContext<TelegramWebAppContextType | null>(null);

export const useTelegramWebApp = () => {
  const context = useContext(TelegramWebAppContext);
  if (!context) {
    throw new Error('useTelegramWebApp must be used within TelegramWebAppProvider');
  }
  return context;
};

interface TelegramWebAppProviderProps {
  children: React.ReactNode;
}

export const TelegramWebAppProvider: FC<TelegramWebAppProviderProps> = ({ children }) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [user, setUser] = useState<unknown>(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [themeParams, setThemeParams] = useState<Record<string, unknown>>({});
  const navigate = useNavigate();
  const { profile, loading } = useAuth();
  const navigatedRef = useRef(false);

  useEffect(() => {
    // Check if Telegram WebApp is available
    const checkWebApp = () => {
      if (telegramWebApp.isAvailable()) {
        setIsAvailable(true);
        setUser(telegramWebApp.getUser());
        setIsDarkTheme(telegramWebApp.isDarkTheme());
        setThemeParams(telegramWebApp.getThemeParams());
        telegramLogin().catch((err) =>
          console.error('Telegram login error:', err)
        );
      }
    };

    // Check immediately
    checkWebApp();

    // Check again after a short delay in case the script loads later
    const timeout = setTimeout(() => {
      if (typeof checkWebApp === 'function') {
        checkWebApp();
      }
    }, 100);


    // Listen for back button
    const handleBackButton = () => {
      // Handle back navigation
      window.history.back();
    };

    window.addEventListener('telegram-back-button', handleBackButton);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('telegram-back-button', handleBackButton);
    };
  }, []);

  useEffect(() => {
    if (
      !navigatedRef.current &&
      isAvailable &&
      profile &&
      !loading &&
      (window.location.pathname === '/' || window.location.pathname === '/welcome')
    ) {
      console.log('Navigate to /account', {
        telegramUser: user,
        user_id: localStorage.getItem('user_id'),
        profile
      });
      navigatedRef.current = true;
      navigate('/account');
    }
  }, [isAvailable, profile, loading, navigate, user]);

  const contextValue: TelegramWebAppContextType = {
    isAvailable,
    user,
    isDarkTheme,
    themeParams,
    sendData: telegramWebApp.sendData.bind(telegramWebApp),
    showAlert: telegramWebApp.showAlert.bind(telegramWebApp),
    showConfirm: telegramWebApp.showConfirm.bind(telegramWebApp),
    hapticFeedback: telegramWebApp.hapticFeedback.bind(telegramWebApp),
    setMainButton: telegramWebApp.setMainButton.bind(telegramWebApp) as any,
    hideMainButton: telegramWebApp.hideMainButton.bind(telegramWebApp),
    showBackButton: telegramWebApp.showBackButton.bind(telegramWebApp),
    hideBackButton: telegramWebApp.hideBackButton.bind(telegramWebApp),
    openTelegramLink: telegramWebApp.openTelegramLink.bind(telegramWebApp)
  };

  return (
    <TelegramWebAppContext.Provider value={contextValue}>
      {children}
    </TelegramWebAppContext.Provider>
  );
};
