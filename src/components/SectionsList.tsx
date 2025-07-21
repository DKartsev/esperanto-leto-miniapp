import { useState, useEffect, type FC } from 'react';
import LoadingScreen from './LoadingScreen';
import { CheckCircle2, Book } from 'lucide-react';
import { fetchSections } from '../services/courseService';
import { useLoadData } from '../hooks/useLoadData';
import { getSectionProgressPercent } from '../services/progressService'

interface Section {
  id: number;
  title: string;
  progress: number;
  isCompleted: boolean;
}

interface SectionsListProps {
  chapterId: number;
  onSectionSelect: (sectionId: number) => void;
  onBackToChapters: () => void;
}

const SectionsList: FC<SectionsListProps> = ({ chapterId, onSectionSelect, onBackToChapters }) => {
  const [sections, setSections] = useState<Section[]>([])
  const { data, loading, error } = useLoadData(async () => {
    const fetched = await fetchSections(chapterId)
    return Promise.all(
      (fetched as Array<{ id: number; title: string }>).map(async (sec) => ({
        id: sec.id,
        title: sec.title || 'Нет названия',
        progress: await getSectionProgressPercent(chapterId, sec.id),
        isCompleted: false,
      }))
    )
  }, [chapterId])

  useEffect(() => {
    if (!data) return
    setSections(
      (data as Section[]).map((sec) => ({
        ...sec,
        isCompleted: sec.progress >= 100,
      }))
    )
  }, [data])


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
    return <LoadingScreen />;
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

      <div className="space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionSelect(section.id)}
            className="w-full bg-white rounded-lg shadow px-3 py-2 flex items-center justify-between"
          >
            <span className="text-sm text-emerald-900 truncate">
              {`Раздел ${section.id} — ${section.title}`}
            </span>
            <span className="flex items-center gap-1 text-sm text-emerald-700">
              {section.isCompleted && <CheckCircle2 className="w-4 h-4 text-green-600" />}
              {section.progress}%
            </span>
          </button>
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
