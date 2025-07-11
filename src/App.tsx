import { useState, useEffect, lazy, Suspense } from 'react';
import { 
  Smartphone, 
  Shield, 
  Zap, 
  ArrowUpDown, 
  Globe, 
  TrendingUp,
  Award,
  Star,
  Users,
  Download,
  ChevronRight,
  Bitcoin,
  Wallet,
  MessageCircle,
  Home,
  FileText,
  Bot,
  User,
  Settings
} from 'lucide-react';

// Import components
import ChaptersList from './components/ChaptersList';
import SectionsList from './components/SectionsList';
import QuestionInterface from './components/QuestionInterface';
import SectionComplete from './components/SectionComplete';
import ChapterComplete from './components/ChapterComplete';
const TestIntro = lazy(() => import('./components/TestIntro'));
const TestInterface = lazy(() => import('./components/TestInterface'));
const TestResults = lazy(() => import('./components/TestResults'));
const AIChat = lazy(() => import('./components/AIChat'));
const MyAccount = lazy(() => import('./components/MyAccount'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
import { useAuth } from './components/SupabaseAuthProvider.jsx';

function App() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  // Learning interface state
  const [currentView, setCurrentView] = useState<'chapters' | 'sections' | 'questions' | 'section-complete' | 'chapter-complete'>('chapters');
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [sectionResults, setSectionResults] = useState<any>(null);

  // Test interface state
  const [testView, setTestView] = useState<'intro' | 'test' | 'results'>('intro');
  const [testResults, setTestResults] = useState<any>(null);

  // Admin panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Get auth data from Supabase
  const { user, profile } = useAuth();

  // Telegram WebApp detection - более точная проверка
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [showNavigation, setShowNavigation] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    
    // Более точная проверка Telegram WebApp
    const checkTelegramWebApp = () => {
      // Проверяем наличие Telegram WebApp API
      const hasTelegramAPI = !!(window.Telegram && window.Telegram.WebApp);
      
      // Проверяем URL параметры
      const urlParams = new URLSearchParams(window.location.search);
      const hasTelegramParams = urlParams.has('tgWebAppData') || 
                               urlParams.has('tgWebAppVersion') ||
                               urlParams.has('tgWebAppPlatform');
      
      // Проверяем user agent
      const isTelegramUserAgent = navigator.userAgent.includes('TelegramBot') ||
                                 navigator.userAgent.includes('Telegram');
      
      // Проверяем referrer
      const isTelegramReferrer = document.referrer.includes('telegram.org') ||
                                document.referrer.includes('t.me');
      
      // WebApp активен только если есть API И (параметры ИЛИ user agent ИЛИ referrer)
      const isWebApp = hasTelegramAPI && (hasTelegramParams || isTelegramUserAgent || isTelegramReferrer);
      
      setIsTelegramWebApp(isWebApp);
      
      // Показываем навигацию если НЕ в Telegram WebApp
      setShowNavigation(!isWebApp);
      
      if (isWebApp && window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        if (tg.initDataUnsafe.user) {
          setTelegramUser(tg.initDataUnsafe.user);
        }
      }
    };
    
    checkTelegramWebApp();
    
    // Handle URL parameters for deep linking from Telegram
    const urlParams = new URLSearchParams(window.location.search);
    const chapter = urlParams.get('chapter');
    const section = urlParams.get('section');
    const mode = urlParams.get('mode');
    
    if (chapter) {
      setSelectedChapter(parseInt(chapter));
      if (section) {
        setSelectedSection(parseInt(section));
        setCurrentView('questions');
      } else {
        setCurrentView('sections');
      }
    }
    
    if (mode === 'practice') {
      setActiveTab('home');
    } else if (mode === 'test') {
      setActiveTab('test');
    } else if (mode === 'ai') {
      setActiveTab('ai');
    }
  }, []);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Безопасные транзакции",
      description: "Военный уровень шифрования защищает ваши средства"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Мгновенные операции",
      description: "Переводы и обмен валют за секунды"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Мультивалютность",
      description: "Поддержка рублей, USDT, Bitcoin, TON и других валют"
    },
    {
      icon: <ArrowUpDown className="w-8 h-8" />,
      title: "P2P обмен",
      description: "Прямые сделки между пользователями"
    }
  ];

  const stats = [
    { number: "1M+", label: "Активных пользователей" },
    { number: "50+", label: "Поддерживаемых валют" },
    { number: "99.9%", label: "Время работы" },
    { number: "24/7", label: "Поддержка" }
  ];

  const currencies = [
    { name: "Рубли", symbol: "RUB", color: "bg-emerald-600", icon: "₽" },
    { name: "Tether", symbol: "USDT", color: "bg-green-600", icon: "₮" },
    { name: "Bitcoin", symbol: "BTC", color: "bg-emerald-700", icon: "₿" },
    { name: "TON", symbol: "TON", color: "bg-green-700", icon: "◊" }
  ];

  // Функция для проверки прав администратора
  const hasAdminAccess = () => {
    return profile?.username?.toLowerCase() === 'admin5050';
  };

  // Базовые элементы навигации
  const baseNavigationItems = [
    { id: 'home', label: 'Главная', icon: Home },
    { id: 'test', label: 'Тест', icon: FileText },
    { id: 'ai', label: 'AI', icon: Bot },
    { id: 'account', label: 'Мой аккаунт', icon: User }
  ];

  // Добавляем кнопку "Админ" только для admin5050
  const navigationItems = hasAdminAccess() 
    ? [...baseNavigationItems, { id: 'admin', label: 'Админ', icon: Settings }]
    : baseNavigationItems;

  const handleTabClick = (tabId: string) => {
    if (tabId === 'admin') {
      if (hasAdminAccess()) {
        setShowAdminPanel(true);
        console.log(`🔐 Открытие административной панели для пользователя: ${profile?.username}`);
      } else {
        console.log(`❌ Отказ в доступе к административной панели для пользователя: ${profile?.username}`);
        alert('У вас нет прав доступа к административной панели.');
      }
      return;
    }
    
    setActiveTab(tabId);
    if (tabId === 'home') {
      setCurrentView('chapters');
    } else if (tabId === 'test') {
      setTestView('intro');
    }
  };

  // Learning interface handlers
  const handleChapterSelect = (chapterId: number) => {
    setSelectedChapter(chapterId);
    setCurrentView('sections');
  };

  const handleSectionSelect = (sectionId: number) => {
    setSelectedSection(sectionId);
    setCurrentView('questions');
  };

  const handleQuestionComplete = (results: any) => {
    setSectionResults(results);
    setCurrentView('section-complete');
  };

  const handleRetryIncorrect = () => {
    setCurrentView('questions');
  };

  const handleCompleteChapter = () => {
    setCurrentView('chapter-complete');
  };

  const handleNextChapter = () => {
    if (selectedChapter) {
      setSelectedChapter(selectedChapter + 1);
      setCurrentView('sections');
    }
  };

  const handleBackToChapters = () => {
    setCurrentView('chapters');
    setSelectedChapter(null);
    setSelectedSection(null);
    setSectionResults(null);
  };

  const handleBackToSections = () => {
    setCurrentView('sections');
    setSelectedSection(null);
  };

  // Test interface handlers
  const handleStartTest = () => {
    setTestView('test');
  };

  const handleTestComplete = (results: any) => {
    setTestResults(results);
    setTestView('results');
  };

  const handleSaveResults = () => {
    // Save results to user profile
    console.log('Saving results:', testResults);
    alert('Результаты сохранены в вашем профиле!');
  };

  const handleRetakeTest = () => {
    setTestView('intro');
    setTestResults(null);
  };

  // Обработчик выхода из теста
  const handleBackFromTest = () => {
    setTestView('intro');
    setTestResults(null);
  };

  // Navigation Component - показываем если showNavigation = true
  const NavigationBar = () => {
    if (!showNavigation) return null;
    
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-200 shadow-lg z-50 safe-area-inset-bottom">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around items-center h-20 px-4 py-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex flex-col items-center justify-center flex-1 py-2 px-2 transition-all duration-200 transform min-h-[60px] relative ${
                    isActive 
                      ? 'text-emerald-600 scale-105' 
                      : 'text-gray-500 hover:text-emerald-500 active:scale-95'
                  }`}
                >
                  <IconComponent 
                    className={`w-6 h-6 mb-1 transition-all duration-200 ${
                      isActive ? 'text-emerald-600' : 'text-gray-500'
                    }`} 
                  />
                  <span className={`text-xs font-medium transition-all duration-200 text-center leading-tight ${
                    isActive ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                  {/* Индикатор для админа */}
                  {item.id === 'admin' && hasAdminAccess() && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-600 rounded-full border-2 border-white"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    );
  };

  // Render Admin Panel
  if (showAdminPanel) {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <AdminPanel
          onClose={() => setShowAdminPanel(false)}
          currentUser={profile?.username || ''}
        />
      </Suspense>
    );
  }

  // Render My Account interface
  if (activeTab === 'account') {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-emerald-50 to-green-50">
        <div className={`flex-1 overflow-y-auto ${showNavigation ? 'pb-24' : ''}`}>
          <Suspense fallback={<div>Loading...</div>}>
            <MyAccount onBackToHome={() => setActiveTab('home')} />
          </Suspense>
        </div>
        <NavigationBar />
      </div>
    );
  }

  // Render AI Chat interface
  if (activeTab === 'ai') {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-1 overflow-hidden">
          <Suspense fallback={<div>Loading...</div>}>
            <AIChat />
          </Suspense>
        </div>
        <NavigationBar />
      </div>
    );
  }

  // Render test interface
  if (activeTab === 'test') {
    switch (testView) {
      case 'intro':
        return (
          <div className={`min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 ${showNavigation ? 'pb-24' : ''}`}>
            <Suspense fallback={<div>Loading...</div>}>
              <TestIntro onStartTest={handleStartTest} />
            </Suspense>
            <NavigationBar />
          </div>
        );
      case 'test':
        return (
          <div className="h-screen flex flex-col">
            <div className="flex-1 overflow-hidden">
              <Suspense fallback={<div>Loading...</div>}>
                <TestInterface
                  onComplete={handleTestComplete}
                  onBack={handleBackFromTest}
                />
              </Suspense>
            </div>
            <NavigationBar />
          </div>
        );
      case 'results':
        return (
          <div className={`min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 ${showNavigation ? 'pb-24' : ''}`}>
            <Suspense fallback={<div>Loading...</div>}>
              <TestResults
                results={testResults}
                onSaveResults={handleSaveResults}
                onRetakeTest={handleRetakeTest}
              />
            </Suspense>
            <NavigationBar />
          </div>
        );
    }
  }

  // Render learning interface for home tab
  if (activeTab === 'home') {
    switch (currentView) {
      case 'chapters':
        return (
          <div className={`min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 ${showNavigation ? 'pb-24' : ''}`}>
            <ChaptersList 
              onChapterSelect={handleChapterSelect} 
              currentUser={profile?.username}
            />
            <NavigationBar />
          </div>
        );
      case 'sections':
        return (
          <div className={`min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 ${showNavigation ? 'pb-24' : ''}`}>
            <SectionsList 
              chapterId={selectedChapter!} 
              onSectionSelect={handleSectionSelect}
              onBackToChapters={handleBackToChapters}
            />
            <NavigationBar />
          </div>
        );
      case 'questions':
        return (
          <QuestionInterface
            chapterId={selectedChapter!}
            sectionId={selectedSection!}
            onComplete={handleQuestionComplete}
            onBackToSections={handleBackToSections}
          />
        );
      case 'section-complete':
        return (
          <SectionComplete
            results={sectionResults}
            chapterId={selectedChapter!}
            sectionId={selectedSection!}
            onRetryIncorrect={handleRetryIncorrect}
            onCompleteChapter={handleCompleteChapter}
          />
        );
      case 'chapter-complete':
        return (
          <ChapterComplete
            chapterId={selectedChapter!}
            onNextChapter={handleNextChapter}
            onBackToChapters={handleBackToChapters}
          />
        );
    }
  }

  // Original landing page content for other tabs (Account)
  return (
    <div className={`min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 ${showNavigation ? 'pb-24' : ''}`}>
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-emerald-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-emerald-900">Esperanto-Leto</h1>
                <p className="text-xs text-emerald-600">
                  {isTelegramWebApp ? 'Telegram WebApp' : 'Мини-приложение'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              <MessageCircle className="w-4 h-4" />
              <span>{isTelegramWebApp ? 'WEBAPP' : 'TELEGRAM'}</span>
              {/* Показываем статус администратора */}
              {hasAdminAccess() && (
                <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                  👑 ADMIN
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm">
                <Star className="w-4 h-4" />
                <span>
                  {isTelegramWebApp ? 'Запущено в Telegram WebApp' : 'Топ-1 криптокошелек в Telegram'}
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-emerald-900 mb-6 leading-tight">
                {isTelegramWebApp ? 'Изучение эсперанто' : 'Ваш криптокошелек'}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                  в Telegram
                </span>
              </h1>
              
              <p className="text-xl text-emerald-700 mb-8 leading-relaxed">
                {isTelegramWebApp 
                  ? 'Полнофункциональное приложение для изучения международного языка эсперанто прямо в Telegram.'
                  : 'Управляйте криптовалютами, совершайте переводы и торгуйте прямо в Telegram. Безопасно, быстро и удобно.'
                }
              </p>
              
              {telegramUser && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                  <p className="text-emerald-800">
                    Добро пожаловать, <strong>{telegramUser.first_name}</strong>! 
                    Ваш прогресс автоматически синхронизируется с Telegram.
                  </p>
                </div>
              )}
              
              {/* Специальное уведомление для администратора */}
              {hasAdminAccess() && (
                <div className="bg-gradient-to-r from-emerald-600 to-green-600 border border-emerald-500 rounded-lg p-4 mb-6 text-white">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Режим администратора активен</span>
                  </div>
                  <p className="text-emerald-100 text-sm">
                    У вас есть полный доступ к административным функциям. 
                    Используйте кнопку "Админ" в навигации для управления системой.
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => handleTabClick('home')}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  <span>{isTelegramWebApp ? 'Начать изучение' : 'Открыть в Telegram'}</span>
                </button>
                <button className="border-2 border-emerald-300 text-emerald-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:border-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-all duration-200 flex items-center justify-center space-x-2">
                  <span>Смотреть демо</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className={`mt-16 lg:mt-0 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="relative">
                {/* Phone mockup */}
                <div className="mx-auto w-80 h-[640px] bg-emerald-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Status bar */}
                    <div className="bg-emerald-50 px-6 py-2 flex justify-between items-center text-sm font-semibold">
                      <span className="text-emerald-900">04:16</span>
                      <div className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs">
                        {isTelegramWebApp ? 'WEBAPP' : 'TELEGRAM'}
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-1 h-3 bg-emerald-400 rounded-full"></div>
                          <div className="w-1 h-3 bg-emerald-400 rounded-full"></div>
                          <div className="w-1 h-3 bg-emerald-900 rounded-full"></div>
                        </div>
                        <span className="text-xs text-emerald-900">45%</span>
                      </div>
                    </div>
                    
                    {/* App content */}
                    <div className="p-6">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-emerald-900 mb-1">Esperanto-Leto</h2>
                        <p className="text-emerald-600 text-sm">
                          {isTelegramWebApp ? 'Telegram WebApp' : 'мини-приложение'}
                        </p>
                      </div>
                      
                      <div className="text-center mb-6">
                        <p className="text-emerald-600 text-sm mb-2">
                          {isTelegramWebApp ? 'Прогресс изучения' : 'Доступно'}
                        </p>
                        <p className="text-4xl font-bold text-emerald-900 mb-1">
                          {isTelegramWebApp ? '75%' : '4 999.66 ₽'}
                        </p>
                        <p className="text-emerald-600">
                          {isTelegramWebApp ? 'Завершено глав: 3/14' : '$63.03'}
                        </p>
                      </div>
                      
                      <div className="flex gap-3 mb-8">
                        <button className="flex-1 bg-emerald-50 text-emerald-600 py-3 rounded-xl font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors">
                          {isTelegramWebApp ? 'Изучать' : 'Пополнить'}
                        </button>
                        <button className="flex-1 bg-emerald-50 text-emerald-700 py-3 rounded-xl font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors">
                          {isTelegramWebApp ? 'Тест' : 'Вывести'}
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {(isTelegramWebApp ? [
                          { name: "Основы", symbol: "Глава 1", color: "bg-emerald-600", icon: "📚", progress: "100%" },
                          { name: "Алфавит", symbol: "Глава 2", color: "bg-green-600", icon: "🔤", progress: "100%" },
                          { name: "Грамматика", symbol: "Глава 3", color: "bg-emerald-700", icon: "📝", progress: "50%" },
                          { name: "Словарь", symbol: "Глава 4", color: "bg-green-700", icon: "📖", progress: "0%" }
                        ] : currencies).map((item, index) => (
                          <div key={item.symbol} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center text-white font-bold shadow-sm`}>
                                {isTelegramWebApp ? (item as any).icon : item.icon}
                              </div>
                              <div>
                                <p className="font-semibold text-emerald-900">{item.name}</p>
                                <p className="text-sm text-emerald-600">{item.symbol}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-emerald-900">
                                {isTelegramWebApp ? (item as any).progress : 
                                 index === 0 ? "4 920.42 RUB" : 
                                 index === 1 ? "0.99 USDT" : "0.0 " + item.symbol}
                              </p>
                              <p className="text-sm text-emerald-600">
                                {isTelegramWebApp ? 'Прогресс' : 
                                 index === 0 ? "≈ $62.03" : "≈ $0.00"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Bitcoin className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {(isTelegramWebApp ? [
              { number: "14", label: "Глав курса" },
              { number: "200+", label: "Упражнений" },
              { number: "99.9%", label: "Точность AI" },
              { number: "24/7", label: "Доступность" }
            ] : stats).map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-emerald-900 mb-2">{stat.number}</div>
                <div className="text-emerald-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-emerald-900 mb-4">
              {isTelegramWebApp ? 'Почему выбирают наше приложение?' : 'Почему выбирают Esperanto-Leto?'}
            </h2>
            <p className="text-xl text-emerald-700">
              {isTelegramWebApp 
                ? 'Все необходимые инструменты для изучения эсперанто в одном месте'
                : 'Все необходимые инструменты для работы с криптовалютами в одном месте'
              }
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {(isTelegramWebApp ? [
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: "Интерактивное обучение",
                  description: "Современные методы изучения с AI-помощником и адаптивными упражнениями"
                },
                {
                  icon: <Zap className="w-8 h-8" />,
                  title: "Быстрый прогресс",
                  description: "Эффективная система обучения позволяет быстро освоить основы языка"
                },
                {
                  icon: <Globe className="w-8 h-8" />,
                  title: "Международный язык",
                  description: "Изучайте язык, который объединяет людей по всему миру"
                },
                {
                  icon: <ArrowUpDown className="w-8 h-8" />,
                  title: "Синхронизация",
                  description: "Ваш прогресс автоматически сохраняется и синхронизируется с Telegram"
                }
              ] : features).map((feature, index) => (
                <div key={index} className="flex space-x-4 group">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-emerald-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-emerald-700 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-emerald-600 to-green-600 rounded-3xl p-8 text-white shadow-2xl">
                <div className="h-full flex flex-col justify-center space-y-6">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">
                      {isTelegramWebApp ? 'Прогресс обучения' : 'Рост портфеля'}
                    </h3>
                    <p className="text-emerald-100">
                      {isTelegramWebApp ? '+75% за неделю' : '+24.5% за месяц'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-2xl font-bold">
                        {isTelegramWebApp ? '3' : '₽4,999'}
                      </div>
                      <div className="text-sm text-emerald-100">
                        {isTelegramWebApp ? 'Главы' : 'Рубли'}
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-2xl font-bold">
                        {isTelegramWebApp ? '85%' : '0.99'}
                      </div>
                      <div className="text-sm text-emerald-100">
                        {isTelegramWebApp ? 'Точность' : 'USDT'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            {isTelegramWebApp 
              ? 'Начните изучение эсперанто уже сегодня'
              : 'Начните использовать Esperanto-Leto уже сегодня'
            }
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            {isTelegramWebApp
              ? 'Присоединяйтесь к тысячам людей, изучающих международный язык эсперанто'
              : 'Присоединяйтесь к миллионам пользователей, которые доверяют нам свои средства'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => handleTabClick('home')}
              className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span>
                {isTelegramWebApp ? 'Начать изучение' : 'Открыть в Telegram'}
              </span>
            </button>
            <div className="flex items-center text-emerald-100">
              <Users className="w-5 h-5 mr-2" />
              <span>
                {isTelegramWebApp 
                  ? 'Более 10 тысяч изучающих'
                  : 'Более 1 млн активных пользователей'
                }
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Esperanto-Leto</h3>
                  <p className="text-sm text-emerald-300">
                    {isTelegramWebApp ? 'Telegram WebApp' : 'Мини-приложение'}
                  </p>
                </div>
              </div>
              <p className="text-emerald-200 mb-6 max-w-md">
                {isTelegramWebApp
                  ? 'Изучайте международный язык эсперанто с помощью современных технологий и AI-помощника прямо в Telegram.'
                  : 'Безопасный и удобный способ управления криптовалютами прямо в Telegram. Торгуйте, переводите и храните средства с максимальной защитой.'
                }
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-emerald-100">
                {isTelegramWebApp ? 'Обучение' : 'Продукт'}
              </h4>
              <ul className="space-y-2 text-emerald-300">
                <li><a href="#" className="hover:text-white transition-colors">
                  {isTelegramWebApp ? 'Главы курса' : 'Кошелек'}
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors">
                  {isTelegramWebApp ? 'AI-помощник' : 'Биржа'}
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors">
                  {isTelegramWebApp ? 'Тесты' : 'P2P'}
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors">
                  {isTelegramWebApp ? 'Прогресс' : 'API'}
                </a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-emerald-100">Поддержка</h4>
              <ul className="space-y-2 text-emerald-300">
                <li><a href="#" className="hover:text-white transition-colors">Помощь</a></li>
                <li><a href="#" className="hover:text-white transition-colors">
                  {isTelegramWebApp ? 'Обратная связь' : 'Безопасность'}
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors">Условия</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Контакты</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-emerald-800 mt-12 pt-8 text-center text-emerald-300">
            <p>&copy; 2024 Esperanto-Leto. Все права защищены.</p>
            {isTelegramWebApp && (
              <p className="mt-2 text-sm">Работает в Telegram WebApp</p>
            )}
            {hasAdminAccess() && (
              <p className="mt-2 text-sm bg-emerald-800 inline-block px-3 py-1 rounded-full">
                👑 Режим администратора активен
              </p>
            )}
          </div>
        </div>
      </footer>

      <NavigationBar />
    </div>
  );
}

export default App;