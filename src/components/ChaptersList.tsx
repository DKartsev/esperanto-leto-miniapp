import { useState, useEffect, type FC } from 'react';
import { Play, Lock, Award, Shield, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { SkeletonCard } from './Skeletons';
import Toast from './Toast';
import { fetchChapters, fetchSections } from '../services/courseService'
import { getAllChaptersProgressPercent, getSectionProgressPercent } from '../services/progressService'
import { isAdmin } from '../utils/adminUtils.js'
import { supabase } from '../services/supabaseClient'

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
  progress?: number;
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
        const progressMap = await getAllChaptersProgressPercent()
        const processed: Chapter[] = []

        for (const ch of data as Array<{ id: number; title: string }>) {
          const progress = progressMap[ch.id] || 0

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
        const withProgress = await Promise.all(
          (data as Section[]).map(async (sec) => ({
            ...sec,
            progress: await getSectionProgressPercent(chapterId, sec.id),
          }))
        );
        setSectionsByChapter((prev) => ({ ...prev, [chapterId]: withProgress }));
      } catch (err) {
        console.error('Ошибка загрузки разделов:', err);
      }
    }
    setOpenChapterId(chapterId);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  return (
    <div className="min-h-screen mx-auto max-w-screen-sm p-4 sm:p-6 space-y-6">
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

      {/* Recommended Chapter */}
      {recommendedChapter && (
        <div className="bg-emerald-50 rounded-xl shadow p-4 mb-4 mx-4 text-left">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-800 mb-2">
            📚 Рекомендуется изучить
          </h3>
          <p className="text-base font-semibold text-gray-900 mb-1 break-words" style={{ textWrap: 'balance' }}>
            {recommendedChapter.title}
          </p>
          {recommendedChapter.description && recommendedChapter.description !== 'Нет данных' && (
            <p className="text-sm text-gray-600 mb-3 break-words">
              {recommendedChapter.description}
            </p>
          )}
          <button
            onClick={() => onChapterSelect(recommendedChapter.id)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Начать обучение
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6">
        <div className="flex items-center gap-3 flex-nowrap">
          <label className="flex items-center text-sm font-medium text-emerald-800">
            <span className="mr-2">Сложность:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="ml-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="all">Все</option>
              <option value="Легкий">Легкий</option>
              <option value="Средний">Средний</option>
              <option value="Сложный">Сложный</option>
            </select>
          </label>

          {!hasAdminAccess() && (
            <label className="flex items-center ml-4 text-sm font-medium text-emerald-800">
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                className="form-checkbox h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="ml-2">Только доступные</span>
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
      <div className="grid gap-4">
        {filteredChapters.map((chapter) => {
          const status = chapter.isLocked && !hasAdminAccess()
            ? '🔒'
            : chapter.isCompleted
              ? '✅'
              : '🔓'
          return (
          <div key={chapter.id} className="w-full max-w-sm mx-auto px-4">
            <div
              className={`relative bg-white rounded-2xl shadow-sm p-3 py-2 space-y-1 ${
                chapter.isLocked && !hasAdminAccess() ? 'opacity-60' : ''
              }`}
            >
              <span className="absolute top-2 right-2 text-sm opacity-70">{status}</span>
              <button
                type="button"
                onClick={() => handleToggleChapter(chapter)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      chapter.isLocked && !hasAdminAccess() ? 'bg-gray-400' : 'bg-emerald-600'
                    }`}
                  >
                    {chapter.isLocked && !hasAdminAccess() ? <Lock className="w-4 h-4" /> : chapter.id}
                  </div>
                  <h3 className="text-sm font-semibold text-emerald-900 truncate">{chapter.title}</h3>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-emerald-600 transition-transform ${openChapterId === chapter.id ? 'rotate-180' : ''}`}
                />
              </button>

              {openChapterId === chapter.id && (
                <motion.ul
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 space-y-1"
                >
                  {sectionsByChapter[chapter.id]?.map((section) => (
                    <li
                      key={section.id}
                      className="flex justify-between items-center text-sm bg-emerald-50 rounded-md px-3 py-1 text-emerald-800"
                    >
                      <span className="truncate">{`Раздел ${section.id} — ${section.title}`}</span>
                      <span className="ml-2 whitespace-nowrap">
                        {section.progress && section.progress >= 100 ? '✅' : `${section.progress ?? 0}%`}
                      </span>
                    </li>
                  ))}
                </motion.ul>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChapterSelect(chapter.id);
                }}
                disabled={chapter.isLocked && !hasAdminAccess()}
                aria-label={
                  chapter.isLocked && !hasAdminAccess()
                    ? 'Заблокировано'
                    : chapter.isStarted
                      ? 'Продолжить'
                      : 'Начать'
                }
                className={`mt-2 max-w-xs w-full px-3 py-1.5 rounded-lg flex items-center justify-center transition-transform hover:scale-105 box-border ${
                  chapter.isLocked && !hasAdminAccess()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white shadow hover:bg-green-700'
                } ${hasAdminAccess() && chapter.isLocked ? 'border-2 border-emerald-400' : ''}`}
              >
                {chapter.isLocked && !hasAdminAccess() ? (
                  <Lock className="w-5 h-5" />
                ) : hasAdminAccess() && chapter.isLocked ? (
                  <Shield className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
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
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}
      </div>
    </div>
  );
};

export default ChaptersList;
