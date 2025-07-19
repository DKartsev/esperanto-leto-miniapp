import { useState, useEffect, type FC } from 'react';
import { Play, Clock, Book, ChevronDown, CheckCircle2 } from 'lucide-react';
import { fetchSections } from '../services/courseService.js';
import { getSectionProgressPercent } from '../services/progressService';
import { supabase } from '../services/supabaseClient.js';
import AnimatedLoader from './AnimatedLoader';

interface Section {
  id: number;
  title: string;
  progress: number;
  duration: string;
  isCompleted: boolean;
  theory?: {
    title: string;
    content: string;
    examples: string[];
    keyTerms: string[];
  };
}

interface SectionsListProps {
  chapterId: number;
  onSectionSelect: (sectionId: number) => void;
  onBackToChapters: () => void;
}

const SectionsList: FC<SectionsListProps> = ({ chapterId, onSectionSelect, onBackToChapters }) => {
  const [expandedTheory, setExpandedTheory] = useState<number | null>(null);
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progressBySectionId, setProgressBySectionId] = useState<Record<number, { accuracy: number; completed: boolean }>>({})

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchSections(chapterId)
        const processed: Section[] = []

        for (const sec of data as Array<{ id: number; title: string }>) {
          const progress = await getSectionProgressPercent(chapterId, sec.id)

          processed.push({
            id: sec.id,
            title: sec.title || 'Нет названия',
            progress,
            duration: '',
            isCompleted: progress === 100,
            theory: { title: '', content: 'Нет данных', examples: [], keyTerms: [] }
          })
        }

        setSections(processed)

        const user_id = localStorage.getItem('user_id')
        if (user_id) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('section_id, accuracy, completed')
            .eq('user_id', user_id)

          if (progressData) {
            const map: Record<number, { accuracy: number; completed: boolean }> = {}
            progressData.forEach((row: any) => {
              map[row.section_id] = { accuracy: row.accuracy, completed: row.completed }
            })
            setProgressBySectionId(map)
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ошибка загрузки'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [chapterId])

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

  const toggleTheory = (sectionId: number) => {
    setExpandedTheory(expandedTheory === sectionId ? null : sectionId);
  };

  const chapterTitle = getChapterTitle(chapterId);

  if (loading) {
    return <AnimatedLoader />;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  return (
    <div className="w-full max-w-screen-sm mx-auto px-4 space-y-4 pt-20">
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

      <div className="grid gap-4">
        {sections.map((section) => (
          <div key={section.id} className="w-full max-w-sm mx-auto px-4">
            <div className="bg-white rounded-xl shadow-md px-4 py-4 mb-4">
            {/* Theory Block */}
            {section.theory && (
              <div className="border-b border-emerald-200">
                <button
                  onClick={() => toggleTheory(section.id)}
                  className="w-full p-5 text-left hover:bg-emerald-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Book className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-emerald-900">Теория</h3>
                        <p className="text-sm text-emerald-600">{section.theory.title}</p>
                      </div>
                    </div>
                    <div className={`transform transition-transform duration-200 ${
                      expandedTheory === section.id ? 'rotate-180' : ''
                    }`}>
                      <ChevronDown className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </button>

                {expandedTheory === section.id && (
                  <div className="px-5 pb-5">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <p className="text-emerald-800 mb-4 leading-relaxed">
                        {section.theory.content}
                      </p>
                      
                      {/* Examples */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-emerald-900 mb-2">Примеры:</h4>
                        <div className="space-y-1">
                          {section.theory.examples.map((example, index) => (
                            <div key={index} className="text-sm text-emerald-700 font-mono bg-white px-3 py-2 rounded border">
                              {example}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Terms */}
                      <div>
                        <h4 className="font-semibold text-emerald-900 mb-2">Ключевые термины:</h4>
                        <div className="flex flex-wrap gap-2">
                          {section.theory.keyTerms.map((term, index) => (
                            <span key={index} className="bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                              {term}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section Content */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    {section.id}
                  </div>
                  <div>
                    <h3
                      className="text-lg font-semibold text-emerald-900 break-words"
                      style={{ textWrap: 'balance' }}
                    >
                      {section.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-emerald-700">
                      <Clock className="w-4 h-4" />
                      <span>{section.duration}</span>
                    </div>
                  </div>
                </div>
                
                {section.isCompleted && (
                  <CheckCircle2 className="text-green-500 w-5 h-5" />
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-emerald-700">Прогресс</span>
                  <span className="text-sm font-semibold text-emerald-600">{section.progress}%</span>
                </div>
                <div className="w-full bg-emerald-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${section.progress}%` }}
                  ></div>
                </div>
                {progressBySectionId[section.id] && (
                  <>
                    <div className="h-2 w-full bg-neutral-200 rounded mt-2">
                      <div
                        className={`h-full rounded transition-all duration-300 ${
                          progressBySectionId[section.id].accuracy >= 70 ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${progressBySectionId[section.id].accuracy}%` }}
                      />
                    </div>
                    <div className="flex items-center text-xs text-gray-600 mt-1">
                      <span>{progressBySectionId[section.id].accuracy}% верно</span>
                      {progressBySectionId[section.id].completed && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 ml-2" />
                      )}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => onSectionSelect(section.id)}
                className="w-full max-w-xs py-2 px-4 rounded-lg flex items-center justify-center gap-2 bg-green-600 text-white font-semibold shadow-sm hover:bg-green-700 hover:scale-105 hover:shadow-md transition-transform duration-200 active:scale-100 box-border"
              >
                <Play className="w-5 h-5" />
                <span>Начать изучение</span>
              </button>
            </div>
          </div>
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
