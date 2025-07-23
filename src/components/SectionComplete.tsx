import { FC, useEffect, useState } from 'react';
import type { QuestionResultItem } from './QuestionInterface';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './SupabaseAuthProvider';
import { useUserId } from '../context/UserContext';
import SectionFailed from './SectionFailed';
import SectionSuccess from './SectionSuccess';
import { getNextStep } from '../utils/navigation.js';
import Toast from './Toast';
import { ACHIEVEMENTS } from '../features/account/Achievements';

interface SectionResults {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: QuestionResultItem[];
  totalHintsUsed: number;
}

interface SectionCompleteProps {
  results: SectionResults;
  chapterId: number;
  sectionId: number;
  newAchievements?: string[];
  onRetry?: () => void;
  onNext?: (nextSectionId?: string, nextChapterId?: string) => void;
}

const SectionComplete: FC<SectionCompleteProps> = ({
  results,
  chapterId,
  sectionId,
  newAchievements,
  onRetry,
  onNext
}) => {
  const { refreshStats } = useAuth();
  const userId = useUserId();
  const percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  const accuracy = results.totalQuestions > 0 ? results.correctAnswers / results.totalQuestions : 0;

  const [nextSectionId, setNextSectionId] = useState<string | undefined>(undefined);
  const [nextChapterId, setNextChapterId] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [achQueue, setAchQueue] = useState<string[]>([]);

  useEffect(() => {
    if (newAchievements && newAchievements.length > 0) {
      setAchQueue(newAchievements);
    }
  }, [newAchievements]);

  useEffect(() => {
    if (!toastMessage && achQueue.length > 0) {
      const type = achQueue[0];
      const title = ACHIEVEMENTS.find(a => a.type === type)?.title || type;
      setToastMessage(`🏆 Новое достижение: ${title}!`);
      setAchQueue(q => q.slice(1));
    }
  }, [toastMessage, achQueue]);

  useEffect(() => {
    getNextStep(sectionId).then(step => {
      setNextSectionId(step.nextSectionId);
      setNextChapterId(step.nextChapterId);
    });
  }, [sectionId]);

  useEffect(() => {
    const saveSectionProgress = async () => {
      const completed = percentage >= 70;
      if (!userId) {
        console.error('userId not available');
        return;
      }

      const upsertData = [
        {
          user_id: userId,
          chapter_id: chapterId,
          section_id: sectionId,
          question_id: null,
          completed,
          accuracy: percentage,
          updated_at: new Date().toISOString()
        }
      ];

      console.log('upsertData', upsertData);
      console.log('user_id', userId);

      const { data, error } = await supabase
        .from('user_progress')
        .upsert(upsertData, { onConflict: 'user_id, section_id, question_id' });

      console.log('user_progress upsert result:', data, error);
      if (error) {
        console.error(error);
      } else {
        console.log('Прогресс раздела успешно сохранён.');
        try {
          await refreshStats();
          setToastMessage('🎉 Раздел пройден! Вы получили +20 XP');
          if (newAchievements && newAchievements.length > 0) {
            setAchQueue(newAchievements);
          }
        } catch (err) {
          console.error('Ошибка обновления статистики:', err);
        }
      }
    };

    saveSectionProgress();
  }, [chapterId, sectionId, percentage, refreshStats, userId]);

  if (accuracy < 0.7) {
    return <SectionFailed sectionId={String(sectionId)} onRetry={onRetry} />;
  }

  if (accuracy >= 0.7) {
    return (
      <>
        <SectionSuccess
          sectionId={String(sectionId)}
          nextSectionId={nextSectionId}
          nextChapterId={nextChapterId}
          onNext={() => onNext && onNext(nextSectionId, nextChapterId)}
        />
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}
      </>
    );
  }

  return <p className="text-center text-gray-400">Контент загружается...</p>;
};

export default SectionComplete;
