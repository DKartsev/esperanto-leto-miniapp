import React, { useState } from 'react';
import { Play, Star, Trophy, BookOpen, Lock, CheckCircle, Clock, Users, TrendingUp, Award, Shield } from 'lucide-react';
import CheckmarkIcon from './CheckmarkIcon';

interface Chapter {
  id: number;
  title: string;
  description: string;
  progress: number;
  badge: string;
  isCompleted: boolean;
  isStarted: boolean;
  isLocked: boolean;
  estimatedTime: string;
  difficulty: 'Легкий' | 'Средний' | 'Сложный';
  sectionsCount: number;
  studentsCount: number;
  rating: number;
  prerequisites?: number[];
}

interface ChaptersListProps {
  onChapterSelect: (chapterId: number) => void;
  currentUser?: string | null | undefined;
}

const ChaptersList: React.FC<ChaptersListProps> = ({ onChapterSelect, currentUser = '' }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Функция для проверки прав администратора
  const hasAdminAccess = () => {
    return currentUser?.toLowerCase() === 'admin5050';
  };

  const chapters: Chapter[] = [
    { 
      id: 1, 
      title: "Введение в Эсперанто", 
      description: "Что такое Эсперанто, история и цели языка, принципы и структура",
      progress: 0,
      badge: "Новичок", 
      isCompleted: false, 
      isStarted: false, 
      isLocked: false, // Всегда доступна
      estimatedTime: "2-3 часа",
      difficulty: "Легкий",
      sectionsCount: 5,
      studentsCount: 15420,
      rating: 4.8
    },
    { 
      id: 2, 
      title: "Алфавит и произношение", 
      description: "Алфавит и звуки, специальные буквы, ударение, правила чтения",
      progress: 0,
      badge: "Новичок", 
      isCompleted: false, 
      isStarted: false, 
      isLocked: !hasAdminAccess(), // Разблокировано для админа
      estimatedTime: "2-3 часа",
      difficulty: "Легкий",
      sectionsCount: 5,
      studentsCount: 13850,
      rating: 4.7,
      prerequisites: [1]
    },
    { 
      id: 3, 
      title: "Словообразование и основы лексики", 
      description: "Корни слов, приставки и суффиксы, сложные слова, создание новых слов",
      progress: 0,
      badge: "Новичок", 
      isCompleted: false, 
      isStarted: false, 
      isLocked: !hasAdminAccess(), // Разблокировано для админа
      estimatedTime: "3-4 часа",
      difficulty: "Средний",
      sectionsCount: 5,
      studentsCount: 12350,
      rating: 4.6,
      prerequisites: [1, 2]
    },
    { 
      id: 4, 
      title: "Существительные", 
      description: "Суффикс -o, множественное число (-j), падежи, род, исключения",
      progress: 0,
      badge: "Новичок", 
      isCompleted: false, 
      isStarted: false, 
      isLocked: !hasAdminAccess(), // Разблокировано для админа
      estimatedTime: "2-3 часа",
      difficulty: "Легкий",
      sectionsCount: 5,
      studentsCount: 11200,
      rating: 4.7,
      prerequisites: [1, 2, 3]
    },
    { 
      id: 5, 
      title: "Прилагательные", 
      description: "Суффикс -a, согласование, порядок слов, степени сравнения",
      progress: 0,
      badge: "Новичок", 
      isCompleted: false, 
      isStarted: false, 
      isLocked: !hasAdminAccess(), // Разблокировано для админа
      estimatedTime: "2-3 часа",
      difficulty: "Легкий",
      sectionsCount: 5,
      studentsCount: 9800,
      rating: 4.5,
      prerequisites: [1, 2, 3, 4]
    },
    { 
      id: 6, 
      title: "Наречия", 
      description: "Суффикс -e, место в предложении, наречия времени и места, сравнение",
      progress: 0,
      badge: "Новичок", 
      isCompleted: false, 
      isStarted: false, 
      isLocked: !hasAdminAccess(), // Разблокировано для админа
      estimatedTime: "2-3 часа",
      difficulty: "Легкий",
      sectionsCount: 4,
      studentsCount: 8500,
      rating: 4.9,
      prerequisites: [1, 2, 3, 4, 5]
    },
    { 
      id: 7, 
      title: "Глаголы. Настоящее, прошедшее, будущее", 
      description: "Времена глаголов: -as, -is, -os, повелительное -u, инфинитив -i",
      progress: 0,
      badge: "Новичок", 
      isCompleted: false, 
      isStarted: false, 
      isLocked: !hasAdminAccess(), // Разблокировано для админа
      estimatedTime: "3-4 часа",
      difficulty: "Средний",
      sectionsCount: 5,
      studentsCount: 7200,
      rating: 4.4,
      prerequisites: [1, 2, 3, 4]
    },
    { 
      id: 8, 
      title: "Глагольные конструкции", 
      description: "Страдательный залог, возвратные глаголы, модальные конструкции",
      progress: 0,
      badge: "Новичок", 
      isCompleted: false, 
      isStarted: false, 
      isLocked: !hasAdminAccess(), // Разблокировано для админа
      estimatedTime: "3-4 часа",
      difficulty: "Сложный",
      sectionsCount: 5,
      studentsCount: 5400,
      rating: 4.3,
      prerequisites: [1, 2, 3, 4, 7]
    },
    { 
      id: 9, 
      title: "Местоимения", 
      description: "Личные, притяжательные, указательные, вопросительные местоимения",
      progress: 0,
      badge: "Новичок", 
      isCompleted: false, 
      isStarted: false, 
      isLocked: !hasAdminAccess(), // Разблокировано для админа
      estimatedTime: "2-3 часа",
      difficulty: "Средний",
      sectionsCount: 5,
      studentsCount: 6100,
      rating: 4.2,
      prerequisites: [1, 2, 3, 4]
    },
    { 
      id: 10, 
      title: "Числительные", 
      description: "Количественные, порядковые, дробные числительные, дата и время",
      progress: 0,
      badge: "Новичок", 
      isCompleted: false, 
      isStarted: false, 
      isLocked: !hasAdminAccess(), // Разблокировано для админа
      estimatedTime: "2-3 часа",
      difficulty: "Легкий",
      sectionsCount: 5,
      studentsCount: 4800,
      rating: 4.7,
      prerequisites: [1, 2, 3, 4]
    },
    { 
      id: 11, 
      title: "Предлоги", 
      description: "Основные предлоги, предлоги направления и времени, сложные случаи",
      progress: 0,
      badge: "Новичок", 
      isCompleted: false, 
      isStarted: false, 
      isLocked: !hasAdminAccess(), // Разблокировано для админа
      estimatedTime: "3-4 часа",
      difficulty: "Средний",
      sectionsCount: 5,
      studentsCount: 3200,
      rating: 4.6,
      prerequisites: [1, 2, 3, 4, 7]
    },
    { 
      id: 12, 
      title: "Вопросительные слова и предложения", 
      description: "Вопросительные местоимения, слово ĉu, прямой и косвенный вопрос",
      progress: 0,
      badge: "Новичок", 
      isCompleted: false, 
      isStarted: false, 
      isLocked: !hasAdminAccess(), // Разблокировано для админа
      estimatedTime: "2-3 часа",
      difficulty: "Средний",
      sectionsCount: 5,
      studentsCount: 2800,
      rating: 4.5,
      prerequisites: [1, 2, 3, 4, 9]
    },
    { 
      id: 13, 
      title: "Синтаксис и структура предложений", 
      description: "Порядок слов, согласование, дополнения, сложные предложения",
      progress: 0,
      badge: "Новичок", 
      isCompleted: false, 
      isStarted: false, 
      isLocked: !hasAdminAccess(), // Разблокировано для админа
      estimatedTime: "4-5 часов",
      difficulty: "Сложный",
      sectionsCount: 5,
      studentsCount: 2100,
      rating: 4.4,
      prerequisites: [1, 2, 3, 4, 7, 11, 12]
    },
    { 
      id: 14, 
      title: "Практика и устойчивые выражения", 
      description: "Приветствия, часто используемые фразы, диалоги, этикет общения",
      progress: 0,
      badge: "Новичок", 
      isCompleted: false, 
      isStarted: false, 
      isLocked: !hasAdminAccess(), // Разблокировано для админа
      estimatedTime: "3-4 часа",
      difficulty: "Средний",
      sectionsCount: 5,
      studentsCount: 1800,
      rating: 4.8,
      prerequisites: [1, 2, 3, 4, 7, 9, 12]
    }
  ];

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Мастер': return <Trophy className="w-4 h-4" />;
      case 'Эксперт': return <Star className="w-4 h-4" />;
      case 'Продвинутый': return <CheckCircle className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Мастер': return 'bg-emerald-600 text-white';
      case 'Эксперт': return 'bg-green-600 text-white';
      case 'Продвинутый': return 'bg-emerald-500 text-white';
      case 'Ученик': return 'bg-green-500 text-white';
      case 'Начинающий': return 'bg-emerald-400 text-emerald-900';
      default: return 'bg-emerald-300 text-emerald-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Легкий': return 'bg-emerald-100 text-emerald-800';
      case 'Средний': return 'bg-yellow-100 text-yellow-800';
      case 'Сложный': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOverallProgress = () => {
    const completedChapters = chapters.filter(ch => ch.isCompleted).length;
    return Math.round((completedChapters / chapters.length) * 100);
  };

  const getNextRecommendedChapter = () => {
    return chapters.find(ch => !ch.isLocked && !ch.isCompleted);
  };

  const filteredChapters = chapters.filter(chapter => {
    if (showOnlyAvailable && chapter.isLocked) return false;
    if (selectedDifficulty !== 'all' && chapter.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const recommendedChapter = getNextRecommendedChapter();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-emerald-900 mb-2">Изучение эсперанто</h1>
        <p className="text-emerald-700 mb-4">Полный курс изучения международного языка эсперанто</p>
        
        {/* Admin Access Indicator */}
        {hasAdminAccess() && (
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl mb-6 shadow-lg">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">👑 Режим администратора: Доступ ко всем главам</span>
            </div>
            <p className="text-emerald-100 text-sm mt-1">
              У вас есть полный доступ ко всем главам курса для администрирования и тестирования
            </p>
          </div>
        )}
        
        {/* Overall Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-emerald-900">Общий прогресс</h2>
            <span className="text-2xl font-bold text-emerald-600">{getOverallProgress()}%</span>
          </div>
          <div className="w-full bg-emerald-200 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getOverallProgress()}%` }}
            ></div>
          </div>
          <p className="text-sm text-emerald-700">
            {chapters.filter(ch => ch.isCompleted).length} из {chapters.length} глав пройдено
            {hasAdminAccess() && (
              <span className="ml-2 text-emerald-600 font-medium">
                (Админ: {chapters.filter(ch => !ch.isLocked).length} доступно)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Recommended Chapter */}
      {recommendedChapter && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900">Рекомендуется изучить</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-emerald-900">{recommendedChapter.title}</h4>
              <p className="text-sm text-emerald-700">{recommendedChapter.description}</p>
            </div>
            <button
              onClick={() => onChapterSelect(recommendedChapter.id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 shadow-lg"
            >
              <Play className="w-4 h-4" />
              <span>Начать</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-emerald-800">Сложность:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="border border-emerald-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-emerald-500 text-emerald-800"
            >
              <option value="all">Все</option>
              <option value="Легкий">Легкий</option>
              <option value="Средний">Средний</option>
              <option value="Сложный">Сложный</option>
            </select>
          </div>
          
          {!hasAdminAccess() && (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-emerald-800">Только доступные</span>
            </label>
          )}
          
          {hasAdminAccess() && (
            <div className="flex items-center space-x-2 bg-emerald-100 px-3 py-1 rounded-full">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-800 font-medium">Админ: Все главы разблокированы</span>
            </div>
          )}
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid gap-6">
        {filteredChapters.map((chapter) => (
          <div
            key={chapter.id}
            className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
              chapter.isLocked && !hasAdminAccess()
                ? 'border-gray-200 opacity-60' 
                : 'border-emerald-200 hover:border-emerald-300'
            }`}
          >
            {/* Chapter Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    chapter.isLocked && !hasAdminAccess() ? 'bg-gray-400' : 'bg-emerald-600'
                  }`}>
                    {chapter.isLocked && !hasAdminAccess() ? <Lock className="w-6 h-6" /> : chapter.id}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-emerald-900">{chapter.title}</h3>
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(chapter.badge)}`}>
                        {getBadgeIcon(chapter.badge)}
                        <span>{chapter.badge}</span>
                      </div>
                      {chapter.isLocked && !hasAdminAccess() && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          🔒 Заблокировано
                        </span>
                      )}
                      {hasAdminAccess() && chapter.isLocked && (
                        <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                          👑 Админ доступ
                        </span>
                      )}
                    </div>
                    
                    <p className="text-emerald-700 mb-3">{chapter.description}</p>
                    
                    {/* Chapter Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-emerald-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{chapter.estimatedTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{chapter.sectionsCount} разделов</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{chapter.studentsCount.toLocaleString()} студентов</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="flex">{renderStars(chapter.rating)}</div>
                        <span>{chapter.rating}</span>
                      </div>
                    </div>
                    
                    {/* Difficulty Badge */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(chapter.difficulty)}`}>
                        {chapter.difficulty}
                      </span>
                    </div>
                    
                    {/* Prerequisites */}
                    {chapter.prerequisites && chapter.prerequisites.length > 0 && !hasAdminAccess() && (
                      <div className="mb-3">
                        <span className="text-xs text-emerald-600">
                          Требуется: {chapter.prerequisites.map(id => `Глава ${id}`).join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {/* Admin Prerequisites Override */}
                    {chapter.prerequisites && chapter.prerequisites.length > 0 && hasAdminAccess() && (
                      <div className="mb-3">
                        <span className="text-xs text-emerald-600">
                          Обычно требуется: {chapter.prerequisites.map(id => `Глава ${id}`).join(', ')}
                        </span>
                        <span className="text-xs text-emerald-700 ml-2 font-medium">
                          (Пропущено для админа)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {chapter.isCompleted && (
                  <CheckmarkIcon size={32} animated={true} />
                )}
              </div>

              {/* Progress Bar */}
              {chapter.progress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-emerald-700">Прогресс</span>
                    <span className="text-sm font-semibold text-emerald-600">{chapter.progress}%</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${chapter.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => onChapterSelect(chapter.id)}
                disabled={chapter.isLocked && !hasAdminAccess()}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  chapter.isLocked && !hasAdminAccess()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : hasAdminAccess() && chapter.isLocked
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg border-2 border-emerald-400'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg'
                }`}
              >
                {chapter.isLocked && !hasAdminAccess() ? (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Заблокировано</span>
                  </>
                ) : hasAdminAccess() && chapter.isLocked ? (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Открыть (Админ)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>{chapter.isStarted ? 'Продолжить' : 'Начать'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Learning Tips */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Award className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-emerald-900">
            {hasAdminAccess() ? 'Административные возможности' : 'Советы по изучению'}
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-emerald-800">
          {hasAdminAccess() ? (
            <>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600">👑</span>
                <span>У вас есть доступ ко всем главам для тестирования и администрирования</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600">🔓</span>
                <span>Все ограничения по предварительным требованиям сняты</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600">⚙️</span>
                <span>Используйте административную панель для управления контентом</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600">📊</span>
                <span>Доступна полная аналитика и статистика пользователей</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600">•</span>
                <span>Рекомендуется проходить главы последовательно для лучшего усвоения материала</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600">•</span>
                <span>Уделяйте изучению 15-30 минут в день для достижения лучших результатов</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600">•</span>
                <span>Изучайте теорию перед выполнением практических заданий</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-emerald-600">•</span>
                <span>Практикуйте полученные знания в разделе "AI Помощник"</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChaptersList;
