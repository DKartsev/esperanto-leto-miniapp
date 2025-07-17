import React, { createContext, useContext, useEffect, useState } from 'react';
import { telegramWebApp } from '../services/telegramWebApp';

interface TelegramWebAppContextType {
  isAvailable: boolean;
  user: any;
  isDarkTheme: boolean;
  themeParams: any;
  sendData: (data: any) => void;
  showAlert: (message: string) => Promise<void>;
  showConfirm: (message: string) => Promise<boolean>;
  hapticFeedback: (type: 'impact' | 'notification' | 'selection', style?: string) => void;
  setMainButton: (params: any) => void;
  hideMainButton: () => void;
  showBackButton: () => void;
  hideBackButton: () => void;
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

export const TelegramWebAppProvider: React.FC<TelegramWebAppProviderProps> = ({ children }) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [user, setUser] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [themeParams, setThemeParams] = useState({});

  useEffect(() => {
    // Check if Telegram WebApp is available
    const checkWebApp = () => {
      if (telegramWebApp.isAvailable()) {
        setIsAvailable(true);
        setUser(telegramWebApp.getUser());
        setIsDarkTheme(telegramWebApp.isDarkTheme());
        setThemeParams(telegramWebApp.getThemeParams());
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

  const contextValue: TelegramWebAppContextType = {
    isAvailable,
    user,
    isDarkTheme,
    themeParams,
    sendData: telegramWebApp.sendData.bind(telegramWebApp),
    showAlert: telegramWebApp.showAlert.bind(telegramWebApp),
    showConfirm: telegramWebApp.showConfirm.bind(telegramWebApp),
    hapticFeedback: telegramWebApp.hapticFeedback.bind(telegramWebApp),
    setMainButton: telegramWebApp.setMainButton.bind(telegramWebApp),
    hideMainButton: telegramWebApp.hideMainButton.bind(telegramWebApp),
    showBackButton: telegramWebApp.showBackButton.bind(telegramWebApp),
    hideBackButton: telegramWebApp.hideBackButton.bind(telegramWebApp)
  };

  return (
    <TelegramWebAppContext.Provider value={contextValue}>
      {children}
    </TelegramWebAppContext.Provider>
  );
};
