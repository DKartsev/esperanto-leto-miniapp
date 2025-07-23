import { useEffect, useState, type FC } from 'react';
import { fetchChapters, fetchSections } from '../services/courseService';
import { useAuth } from './SupabaseAuthProvider';
import useUserProgress from '../hooks/useUserProgress';
import SectionsList from './SectionsList';

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
        const sectionLists = await Promise.all(ch.map(c => fetchSections(c.id)));

        const list: ChapterData[] = ch.map((c, idx) => {
          const secs = sectionLists[idx] as Array<{ id: number }>;
          const sections: SectionInfo[] = secs.map((s, sIdx) => {
            const progress = sectionProgressMap[s.id] || { accuracy: 0, completed: false };
            return {
              id: s.id,
              index: sIdx + 1,
              completed: progress.completed || progress.accuracy >= 70,
              unlocked: false,
              xp: 20,
            };
          });

          for (let i = 0; i < sections.length; i++) {
            sections[i].unlocked = i === 0 || sections[i - 1].completed;
          }

          return { id: c.id, title: c.title || getChapterTitle(c.id), sections };
        });

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

  const handleSelect = (chapterId: number, sectionId: number) => {
    onSectionSelect(chapterId, sectionId);
  };

  return (
    <div className="min-h-screen overflow-y-auto pb-safe px-4 pt-4 space-y-8 max-w-screen-sm mx-auto">
      {chapters.map((ch) => (
        <SectionsList
          key={ch.id}
          chapterId={ch.id}
          sections={ch.sections}
          onSectionSelect={(sectionId) => handleSelect(ch.id, sectionId)}
        />
      ))}
    </div>
  );
};

export default ChaptersAndSections;
