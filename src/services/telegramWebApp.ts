// Telegram WebApp API integration

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    setText(text: string): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
    setParams(params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }): void;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  ready(): void;
  expand(): void;
  close(): void;
  sendData(data: string): void;
  openLink(url: string): void;
  openTelegramLink(url: string): void;
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }, callback?: (buttonId: string) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

class TelegramWebAppService {
  private webApp: TelegramWebApp | null = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      this.isInitialized = true;
      
      // Initialize the WebApp
      this.webApp.ready();
      
      // Expand the WebApp to full height
      this.webApp.expand();
      
      // Set up theme
      this.setupTheme();
      
      // Set up back button
      this.setupBackButton();
      
      console.log('Telegram WebApp initialized:', {
        version: this.webApp.version,
        platform: this.webApp.platform,
        user: this.webApp.initDataUnsafe.user
      });
    }
  }

  private setupTheme() {
    if (!this.webApp) return;

    // Apply Telegram theme to the app
    const themeParams = this.webApp.themeParams;
    const root = document.documentElement;

    if (themeParams.bg_color) {
      root.style.setProperty('--tg-bg-color', themeParams.bg_color);
    }
    if (themeParams.text_color) {
      root.style.setProperty('--tg-text-color', themeParams.text_color);
    }
    if (themeParams.button_color) {
      root.style.setProperty('--tg-button-color', themeParams.button_color);
    }
    if (themeParams.button_text_color) {
      root.style.setProperty('--tg-button-text-color', themeParams.button_text_color);
    }

    // Add theme class to body
    document.body.classList.add(`tg-theme-${this.webApp.colorScheme}`);
  }

  private setupBackButton() {
    if (!this.webApp) return;

    this.webApp.BackButton.onClick(() => {
      // Handle back button click
      const event = new CustomEvent('telegram-back-button');
      window.dispatchEvent(event);
    });
  }

  // Public methods
  isAvailable(): boolean {
    return this.isInitialized && this.webApp !== null;
  }

  getUser() {
    return this.webApp?.initDataUnsafe.user || null;
  }

  getInitData(): string {
    return this.webApp?.initData || '';
  }

  showBackButton() {
    this.webApp?.BackButton.show();
  }

  hideBackButton() {
    this.webApp?.BackButton.hide();
  }

  setMainButton(params: {
    text: string;
    color?: string;
    textColor?: string;
    onClick?: () => void;
  }) {
    if (!this.webApp) return;

    this.webApp.MainButton.setText(params.text);
    
    if (params.color) {
      this.webApp.MainButton.color = params.color;
    }
    
    if (params.textColor) {
      this.webApp.MainButton.textColor = params.textColor;
    }
    
    if (params.onClick) {
      this.webApp.MainButton.onClick(params.onClick);
    }
    
    this.webApp.MainButton.show();
  }

  hideMainButton() {
    this.webApp?.MainButton.hide();
  }

  sendData(data: unknown) {
    if (!this.webApp) return;

    this.webApp.sendData(JSON.stringify(data));
  }

  showAlert(message: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.webApp) {
        this.webApp.showAlert(message, resolve);
      } else {
        alert(message);
        resolve();
      }
    });
  }

  showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.webApp) {
        this.webApp.showConfirm(message, resolve);
      } else {
        resolve(confirm(message));
      }
    });
  }

  hapticFeedback(type: 'impact' | 'notification' | 'selection', style?: string) {
    if (!this.webApp) return;

    switch (type) {
      case 'impact':
        this.webApp.HapticFeedback.impactOccurred(
          (style as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') || 'medium'
        );
        break;
      case 'notification':
        this.webApp.HapticFeedback.notificationOccurred(
          (style as 'error' | 'success' | 'warning') || 'success'
        );
        break;
      case 'selection':
        this.webApp.HapticFeedback.selectionChanged();
        break;
    }
  }

  close() {
    this.webApp?.close();
  }

  openLink(url: string) {
    this.webApp?.openLink(url);
  }

  // Theme utilities
  isDarkTheme(): boolean {
    return this.webApp?.colorScheme === 'dark';
  }

  getThemeParams() {
    return this.webApp?.themeParams || {};
  }

  // Viewport utilities
  getViewportHeight(): number {
    return this.webApp?.viewportHeight || window.innerHeight;
  }

  getStableViewportHeight(): number {
    return this.webApp?.viewportStableHeight || window.innerHeight;
  }
}

// Export singleton instance
export const telegramWebApp = new TelegramWebAppService();

// React hook for using Telegram WebApp
export const useTelegramWebApp = () => {
  return {
    webApp: telegramWebApp,
    isAvailable: telegramWebApp.isAvailable(),
    user: telegramWebApp.getUser(),
    isDarkTheme: telegramWebApp.isDarkTheme(),
    themeParams: telegramWebApp.getThemeParams()
  };
};
