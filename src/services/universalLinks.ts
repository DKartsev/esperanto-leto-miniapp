// Universal Links and Deep Linking Service

interface UniversalLinkConfig {
  telegramBotUsername: string;
  webAppUrl: string;
  appStoreId?: string;
  playStoreId?: string;
}

class UniversalLinksService {
  private config: UniversalLinkConfig;

  constructor(config: UniversalLinkConfig) {
    this.config = config;
    this.init();
  }

  private init() {
    this.setupUniversalLinkHandling();
    this.setupDeepLinkHandling();
  }

  private setupUniversalLinkHandling() {
    // Handle iOS Universal Links
    if (this.isIOS()) {
      this.handleIOSUniversalLinks();
    }

    // Handle Android App Links
    if (this.isAndroid()) {
      this.handleAndroidAppLinks();
    }
  }

  private setupDeepLinkHandling() {
    // Parse URL parameters for deep linking
    const urlParams = new URLSearchParams(window.location.search);
    const startParam = urlParams.get('startapp') || urlParams.get('start');
    
    if (startParam) {
      this.handleDeepLink(startParam);
    }
  }

  private handleIOSUniversalLinks() {
    // Check if app is available
    const isAppInstalled = this.checkIfTelegramInstalled();
    
    if (!isAppInstalled) {
      this.showInstallPrompt('ios');
    }
  }

  private handleAndroidAppLinks() {
    // Check if app is available
    const isAppInstalled = this.checkIfTelegramInstalled();
    
    if (!isAppInstalled) {
      this.showInstallPrompt('android');
    }
  }

  private handleDeepLink(startParam: string) {
    try {
      // Decode and parse the start parameter
      const decodedParam = decodeURIComponent(startParam);
      const params = new URLSearchParams(decodedParam);
      
      // Extract navigation parameters
      const chapter = params.get('chapter');
      const section = params.get('section');
      const mode = params.get('mode');
      
      // Dispatch custom event for app to handle
      const event = new CustomEvent('deep-link', {
        detail: { chapter, section, mode, originalParam: startParam }
      });
      
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  }

  private checkIfTelegramInstalled(): boolean {
    // This is a simplified check - in reality, you'd need more sophisticated detection
    // Ensure we return an explicit boolean value
    return !!(window.Telegram && window.Telegram.WebApp);
  }

  private showInstallPrompt(platform: 'ios' | 'android') {
    const message = platform === 'ios' 
      ? 'Для лучшего опыта установите Telegram из App Store'
      : 'Для лучшего опыта установите Telegram из Google Play';
    
    const storeUrl = platform === 'ios'
      ? `https://apps.apple.com/app/telegram-messenger/id686449807`
      : `https://play.google.com/store/apps/details?id=org.telegram.messenger`;
    
    if (confirm(message)) {
      window.open(storeUrl, '_blank');
    }
  }

  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  private isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  // Public methods
  generateTelegramWebAppUrl(params?: Record<string, string>): string {
    const baseUrl = `https://t.me/${this.config.telegramBotUsername}/webapp`;
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      return `${baseUrl}?startapp=${encodeURIComponent(searchParams.toString())}`;
    }
    
    return baseUrl;
  }

  generateUniversalLink(path?: string, params?: Record<string, string>): string {
    let url = this.config.webAppUrl;
    
    if (path) {
      url += path;
    }
    
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    
    return url;
  }

  shareLink(params?: Record<string, string>): void {
    const telegramUrl = this.generateTelegramWebAppUrl(params);
    
    if (navigator.share) {
      navigator.share({
        title: 'Esperanto-Leto',
        text: 'Изучайте эсперанто в Telegram!',
        url: telegramUrl
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(telegramUrl).then(() => {
        alert('Ссылка скопирована в буфер обмена!');
      });
    }
  }

  openInTelegram(params?: Record<string, string>): void {
    const telegramUrl = this.generateTelegramWebAppUrl(params);
    window.open(telegramUrl, '_blank');
  }
}

// Initialize the service
export const universalLinks = new UniversalLinksService({
  telegramBotUsername: 'EsperantoLetoBot',
  webAppUrl: 'https://tgminiapp.esperanto-leto.ru',
  appStoreId: '686449807', // Telegram iOS App ID
  playStoreId: 'org.telegram.messenger' // Telegram Android Package
});

// React hook for using universal links
export const useUniversalLinks = () => {
  return {
    generateTelegramUrl: universalLinks.generateTelegramWebAppUrl.bind(universalLinks),
    generateUniversalLink: universalLinks.generateUniversalLink.bind(universalLinks),
    shareLink: universalLinks.shareLink.bind(universalLinks),
    openInTelegram: universalLinks.openInTelegram.bind(universalLinks)
  };
};