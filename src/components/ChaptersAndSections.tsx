import { useEffect, useState, type FC } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { fetchChapters, fetchSections } from '../services/courseService';
import { useAuth } from './SupabaseAuthProvider';
import useUserProgress from '../hooks/useUserProgress';

interface ChaptersAndSectionsProps {
  onSectionSelect: (chapterId: number, sectionId: number) => void;
}

interface SectionInfo {
  id: number;
  index: number;
  unlocked: boolean;
  completed: boolean;
  xp: number;
}

interface ChapterData {
  id: number;
  title: string;
  sections: SectionInfo[];
}

const getChapterTitle = (chapterId: number): string => {
  switch (chapterId) {
    case 1:
      return 'Основы эсперанто';
    case 2:
      return 'Основные глаголы и действия';
    case 3:
      return 'Грамматика';
    case 4:
      return 'Словарный запас';
    case 5:
      return 'Произношение';
    case 6:
      return 'Диалоги';
    case 7:
      return 'Культура';
    case 8:
      return 'Литература';
    case 9:
      return 'История языка';
    case 10:
      return 'Практические упражнения';
    case 11:
      return 'Итоговый тест';
    default:
      return `Глава ${chapterId}`;
  }
};

const ChaptersAndSections: FC<ChaptersAndSectionsProps> = ({ onSectionSelect }) => {
  const { profile } = useAuth();
  const { sectionProgressMap = {} } = useUserProgress(profile?.id);

  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const ch = await fetchChapters();
        const list: ChapterData[] = [];
        for (const c of ch as Array<{ id: number; title: string }>) {
          const secs = await fetchSections(c.id);
          const sections: SectionInfo[] = (secs as Array<{ id: number }>).map((s, idx) => {
            const progress = sectionProgressMap[s.id] || { accuracy: 0, completed: false };
            return {
              id: s.id,
              index: idx + 1,
              completed: progress.completed || progress.accuracy >= 70,
              unlocked: false,
              xp: 20,
            };
          });
          for (let i = 0; i < sections.length; i++) {
            sections[i].unlocked = i === 0 || sections[i - 1].completed;
          }
          list.push({ id: c.id, title: c.title || getChapterTitle(c.id), sections });
        }
        setChapters(list);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [sectionProgressMap]);

  if (loading) {
    return <p className="p-6 text-gray-500">Загрузка...</p>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  const handleSelect = (chapterId: number, section: SectionInfo) => {
    if (!section.unlocked) return;
    onSectionSelect(chapterId, section.id);
  };

  return (
    <div className="min-h-screen overflow-y-auto pb-safe px-4 pt-4 space-y-8 max-w-screen-sm mx-auto">
      {chapters.map((ch) => {
        const completedCount = ch.sections.filter((s) => s.completed).length;
        return (
          <div key={ch.id} className="space-y-4">
            <h2 className="text-lg font-semibold text-emerald-900">
              {`${ch.id} (${completedCount}/${ch.sections.length}) ${getChapterTitle(ch.id)}`}
            </h2>
            <div className="relative py-4">
              <div className="absolute left-1/2 top-0 bottom-0 border-l-2 border-dashed border-gray-300" />
              <div className="space-y-6">
                {ch.sections.map((sec, i) => (
                  <motion.div
                    key={sec.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="grid grid-cols-2 items-center"
                  >
                    {i % 2 === 0 ? (
                      <div className="relative flex justify-end pr-4">
                        <button
                          onClick={() => handleSelect(ch.id, sec)}
                          disabled={!sec.unlocked}
                          className={clsx(
                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border',
                            sec.completed
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : sec.unlocked
                              ? 'bg-white text-emerald-600 border-emerald-600'
                              : 'bg-gray-200 text-gray-300 border-gray-300 cursor-not-allowed'
                          )}
                          style={{ cursor: sec.unlocked ? 'pointer' : 'not-allowed' }}
                        >
                          {sec.index}
                        </button>
                        <div className="absolute top-1/2 right-full w-4 border-t-2 border-dashed border-gray-300" />
                        {sec.completed && (
                          <span className="absolute top-full mt-1 text-[10px] text-emerald-600">+{sec.xp} XP</span>
                        )}
                      </div>
                    ) : (
                      <div className="relative flex justify-start pl-4">
                        <button
                          onClick={() => handleSelect(ch.id, sec)}
                          disabled={!sec.unlocked}
                          className={clsx(
                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border',
                            sec.completed
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : sec.unlocked
                              ? 'bg-white text-emerald-600 border-emerald-600'
                              : 'bg-gray-200 text-gray-300 border-gray-300 cursor-not-allowed'
                          )}
                          style={{ cursor: sec.unlocked ? 'pointer' : 'not-allowed' }}
                        >
                          {sec.index}
                        </button>
                        <div className="absolute top-1/2 left-full w-4 border-t-2 border-dashed border-gray-300" />
                        {sec.completed && (
                          <span className="absolute top-full mt-1 text-[10px] text-emerald-600">+{sec.xp} XP</span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChaptersAndSections;
