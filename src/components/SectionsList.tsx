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

  const chunkedSections: typeof sectionsWithStatus[][] = []
  for (let i = 0; i < sectionsWithStatus.length; i += 4) {
    chunkedSections.push(sectionsWithStatus.slice(i, i + 4))
  }


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

  const chapterTitle = getChapterTitle(chapterId);

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
          <h1 className="text-2xl font-bold text-emerald-900">{chapterTitle}</h1>
          <p className="text-emerald-700">Изучите теорию, затем выберите раздел для практики</p>
        </div>
      </div>

      <div className="space-y-4">
        {chunkedSections.map((row, i) => (
          <div
            key={i}
            className={clsx('flex gap-4', i % 2 === 1 && 'flex-row-reverse')}
          >
            {row.map((section, j) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: j * 0.05 }}
                onClick={
                  section.unlocked ? () => onSectionSelect(section.id) : undefined
                }
                className={clsx(
                  'relative flex flex-col items-center cursor-pointer',
                  !section.unlocked && 'pointer-events-none opacity-50'
                )}
              >
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border',
                    section.completed
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : section.unlocked
                      ? 'bg-white text-gray-800 border-gray-400'
                      : 'bg-gray-200 text-gray-400 border-gray-300'
                  )}
                >
                  {section.index}
                </div>
                {section.completed && (
                  <span className="text-[10px] text-emerald-600 mt-1">
                    +{section.xp} XP
                  </span>
                )}
                {j < row.length - 1 && (
                  <div className="absolute top-1/2 left-full w-4 border-t-2 border-dashed border-gray-300" />
                )}
              </motion.div>
            ))}
          </div>
        ))}
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
