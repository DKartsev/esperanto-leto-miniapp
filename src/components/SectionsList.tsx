import { type FC } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { SkeletonSectionList } from './Skeletons'
import { Book } from 'lucide-react'
import { fetchSections } from '../services/courseService'
import { useLoadData } from '../hooks/useLoadData'
import useUserProgress from '../hooks/useUserProgress'
import { useAuth } from './SupabaseAuthProvider'

interface Section {
  id: number
  title: string
}

interface SectionsListProps {
  chapterId: number;
  onSectionSelect: (sectionId: number) => void;
  onBackToChapters: () => void;
}

const SectionsList: FC<SectionsListProps> = ({ chapterId, onSectionSelect, onBackToChapters }) => {
  const { profile } = useAuth()
  const { sectionProgressMap = {} } = useUserProgress(profile?.id)

  const { data, loading, error } = useLoadData(async () => {
    const fetched = await fetchSections(chapterId)
    return (fetched as Array<{ id: number; title: string }>).map((sec) => ({
      id: sec.id,
      title: sec.title || 'Нет названия',
    }))
  }, [chapterId])

  const sections: Array<Section & { progress: number; isCompleted: boolean }> =
    ((data as Section[]) || []).map((sec) => {
      const progressInfo = sectionProgressMap[sec.id] || {
        accuracy: 0,
        completed: false,
      }
      const progress = Math.round(progressInfo.accuracy)
      const isCompleted = progressInfo.completed || progress >= 70
      return { ...sec, progress, isCompleted }
    }) || []

  const sectionsWithStatus = sections.map((sec, idx, arr) => ({
    id: sec.id,
    index: idx + 1,
    completed: sec.isCompleted,
    unlocked: idx === 0 || arr[idx - 1].isCompleted,
    xp: 20,
  }))

  const completedCount = sectionsWithStatus.filter(s => s.completed).length


  const getChapterTitle = (chapterId: number): string => {
    switch (chapterId) {
      case 1: return "Основы эсперанто";
      case 2: return "Основные глаголы и действия";
      case 3: return "Грамматика";
      case 4: return "Словарный запас";
      case 5: return "Произношение";
      case 6: return "Диалоги";
      case 7: return "Культура";
      case 8: return "Литература";
      case 9: return "История языка";
      case 10: return "Практические упражнения";
      case 11: return "Итоговый тест";
      default: return `Глава ${chapterId}`;
    }
  };

  const chapterTitle = getChapterTitle(chapterId)
  const totalSections = sectionsWithStatus.length
  const headerTitle = `${chapterId} (${completedCount}/${totalSections}) ${chapterTitle}`

  if (loading) {
    return <SkeletonSectionList />;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  return (
    <div className="min-h-screen w-full max-w-screen-sm mx-auto px-4 sm:px-6 pt-20 space-y-4">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBackToChapters}
          className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-semibold text-emerald-900">{headerTitle}</h1>
        </div>
      </div>

      <div className="relative max-h-[calc(100vh-200px)] overflow-y-auto py-4">
        <div className="absolute left-1/2 top-0 bottom-0 border-l-2 border-dashed border-gray-300" />
        <div className="space-y-6">
          {sectionsWithStatus.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid grid-cols-2 items-center"
            >
              {i % 2 === 0 ? (
                <div className="relative flex justify-end pr-4">
                  <button
                    onClick={section.unlocked ? () => onSectionSelect(section.id) : undefined}
                    disabled={!section.unlocked}
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border transition-colors',
                      section.completed
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : section.unlocked
                        ? 'bg-white text-emerald-600 border-emerald-600'
                        : 'bg-gray-200 text-gray-400 border-gray-300'
                    )}
                  >
                    {section.index}
                  </button>
                  <div className="absolute top-1/2 right-full w-4 border-t-2 border-dashed border-gray-300" />
                  {section.completed && (
                    <span className="absolute top-full mt-1 text-[10px] text-emerald-600">
                      +{section.xp} XP
                    </span>
                  )}
                </div>
              ) : (
                <div className="relative flex justify-start pl-4">
                  <button
                    onClick={section.unlocked ? () => onSectionSelect(section.id) : undefined}
                    disabled={!section.unlocked}
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border transition-colors',
                      section.completed
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : section.unlocked
                        ? 'bg-white text-emerald-600 border-emerald-600'
                        : 'bg-gray-200 text-gray-300 border-gray-300'
                    )}
                  >
                    {section.index}
                  </button>
                  <div className="absolute top-1/2 left-full w-4 border-t-2 border-dashed border-gray-300" />
                  {section.completed && (
                    <span className="absolute top-full mt-1 text-[10px] text-emerald-600">
                      +{section.xp} XP
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Study Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-xl p-6 mt-8">
        <div className="flex items-center space-x-2 mb-3">
          <Book className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Рекомендации по изучению</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Сначала изучите теорию каждого раздела, затем переходите к практическим вопросам</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Обращайте внимание на примеры — они помогут понять применение правил</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Запоминайте ключевые термины — они встретятся в вопросах</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-600">•</span>
            <span>Проходите разделы последовательно для лучшего понимания материала</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionsList;
