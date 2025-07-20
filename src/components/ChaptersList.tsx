import { useState, useEffect, type FC } from 'react';
import { Play, Star, Trophy, BookOpen, Lock, CheckCircle, TrendingUp, Award, Shield } from 'lucide-react';
import LoadingVideo from './LoadingVideo';
import Toast from './Toast';
import { fetchChapters, fetchSections } from '../services/courseService.js'
import { getChapterProgressPercent } from '../services/progressService'
import { isAdmin } from '../utils/adminUtils.js'
import { supabase } from '../services/supabaseClient.js'

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

interface Section {
  id: number;
  title: string;
}

interface ChaptersListProps {
  onChapterSelect: (chapterId: number) => void;
  currentUser?: string | null | undefined;
}

const ChaptersList: FC<ChaptersListProps> = ({ onChapterSelect, currentUser = '' }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Функция для проверки прав администратора
  const hasAdminAccess = () => {
    return isAdmin(currentUser);
  };

  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chapterProgress, setChapterProgress] = useState<Record<number, { completed: boolean; average_accuracy: number }>>({})
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [openChapterId, setOpenChapterId] = useState<number | null>(null)
  const [sectionsByChapter, setSectionsByChapter] = useState<Record<number, Section[]>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchChapters()
        const processed: Chapter[] = []

        for (const ch of data as Array<{ id: number; title: string }>) {
          const progress = await getChapterProgressPercent(ch.id)

          processed.push({
            id: ch.id,
            title: ch.title || 'Нет названия',
            description: 'Нет данных',
            progress,
            badge: 'Новичок',
            isCompleted: progress === 100,
            isStarted: progress > 0,
            isLocked: false,
            estimatedTime: '',
            difficulty: 'Легкий',
            sectionsCount: 0,
            studentsCount: 0,
            rating: 0
          })
        }

        setChapters(processed)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ошибка загрузки'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const loadProgress = async () => {
      const user_id = localStorage.getItem('user_id')
      if (!user_id) return
      const { data } = await supabase
        .from('user_chapter_progress')
        .select('chapter_id, completed, average_accuracy')
        .eq('user_id', user_id)

      if (data) {
        const map: Record<number, { completed: boolean; average_accuracy: number }> = {}
        data.forEach((row: any) => {
          map[row.chapter_id] = {
            completed: row.completed,
            average_accuracy: row.average_accuracy
          }
        })
        setChapterProgress(map)
      }
    }

    loadProgress()
  }, [])

  // Показываем уведомление о завершении главы
  useEffect(() => {
    if (!chapters.length) return
    for (const ch of chapters) {
      if (chapterProgress[ch.id]?.completed) {
        const key = `chapter_reward_${ch.id}`
        if (!localStorage.getItem(key)) {
          setToastMessage(`Поздравляем! Вы завершили главу ${ch.title}`)
          localStorage.setItem(key, 'true')
          break
        }
      }
    }
  }, [chapterProgress, chapters])


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

  const getOverallProgress = () => {
    if (chapters.length === 0) return 0
    const completedChapters = chapters.filter(ch => ch.isCompleted).length
    return Math.round((completedChapters / chapters.length) * 100)
  };

  const getNextRecommendedChapter = () => {
    return chapters.find(ch => !ch.isLocked && !ch.isCompleted);
  };

  const filteredChapters = chapters.filter(chapter => {
    if (showOnlyAvailable && chapter.isLocked) return false;
    if (selectedDifficulty !== 'all' && chapter.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const recommendedChapter = getNextRecommendedChapter();

  const handleToggleChapter = async (chapter: Chapter) => {
    if (chapter.isLocked && !hasAdminAccess()) return;
    const chapterId = chapter.id;
    if (openChapterId === chapterId) {
      setOpenChapterId(null);
      return;
    }
    if (!sectionsByChapter[chapterId]) {
      try {
        const data = await fetchSections(chapterId);
        setSectionsByChapter(prev => ({ ...prev, [chapterId]: data as Section[] }));
      } catch (err) {
        console.error('Ошибка загрузки разделов:', err);
      }
    }
    setOpenChapterId(chapterId);
  };

  if (loading) {
    return <LoadingVideo />;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  return (
    <div className="p-6 pt-2 space-y-6 mx-auto max-w-screen-sm">
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
        
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Overall Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6">
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

      {/* Recommended Chapter */}
      {recommendedChapter && (
        <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 flex flex-col items-center text-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900">Рекомендуется изучить</h3>
          </div>
          <div>
            <h4
              className="font-semibold text-emerald-900 break-words"
              style={{ textWrap: 'balance' }}
            >
              {recommendedChapter.title}
            </h4>
            <p className="text-sm text-emerald-700 break-words">{recommendedChapter.description}</p>
          </div>
          <button
            onClick={() => onChapterSelect(recommendedChapter.id)}
            className="w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 bg-green-600 text-white font-semibold shadow-sm hover:bg-green-700 hover:scale-105 hover:shadow-md transition-transform duration-200 active:scale-100 box-border"
          >
            <Play className="w-4 h-4" />
            <span>Начать</span>
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6">
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
          <div key={chapter.id} className="w-full max-w-sm mx-auto px-4">
            <div
              onClick={() => handleToggleChapter(chapter)}
              className={`rounded-2xl bg-white shadow p-4 text-center space-y-2 cursor-pointer ${
                chapter.isLocked && !hasAdminAccess() ? 'opacity-60' : ''
              }`}
            >
              <div
                className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg ${
                  chapter.isLocked && !hasAdminAccess() ? 'bg-gray-400' : 'bg-emerald-600'
                }`}
              >
                {chapter.isLocked && !hasAdminAccess() ? <Lock className="w-6 h-6" /> : chapter.id}
              </div>

              <h3 className="text-lg font-semibold text-emerald-900 break-words" style={{ textWrap: 'balance' }}>
                {chapter.title}
              </h3>

              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(chapter.badge)}`}>
                {getBadgeIcon(chapter.badge)}
                <span>{chapter.badge}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChapterSelect(chapter.id);
                }}
                disabled={chapter.isLocked && !hasAdminAccess()}
                className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold transition-transform duration-200 box-border ${
                  chapter.isLocked && !hasAdminAccess()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white shadow hover:bg-green-700 hover:scale-105 active:scale-100'
                } ${hasAdminAccess() && chapter.isLocked ? 'border-2 border-emerald-400' : ''}`}
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

              {openChapterId === chapter.id && (
                <ul className="mt-4 space-y-2 text-left">
                  {sectionsByChapter[chapter.id]?.map((section) => (
                    <li
                      key={section.id}
                      className="max-w-[90%] ml-4 border-l-4 border-green-400 rounded-lg bg-gray-50 shadow-sm px-3 py-2 text-sm text-emerald-800"
                    >
                      {section.title}
                    </li>
                  ))}
                </ul>
              )}
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
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}
      </div>
    </div>
  );
};

export default ChaptersList;
