import { FC, useEffect, useState } from 'react';
import type { QuestionResultItem } from './QuestionInterface';
import { supabase } from '../services/supabaseClient.js';
import { findOrCreateUserProfile } from '../services/authService.js';
import SectionFailed from './SectionFailed';
import SectionSuccess from './SectionSuccess';
import { getNextStep } from '../utils/navigation.js';

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
  onRetry?: () => void;
  onNext?: (nextSectionId?: string, nextChapterId?: string) => void;
}

const SectionComplete: FC<SectionCompleteProps> = ({
  results,
  chapterId,
  sectionId,
  onRetry,
  onNext
}) => {
  const percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  const incorrectCount = results.incorrectAnswers.length;
  const accuracy = results.totalQuestions > 0 ? results.correctAnswers / results.totalQuestions : 0;

  const [nextSectionId, setNextSectionId] = useState<string | undefined>(undefined);
  const [nextChapterId, setNextChapterId] = useState<string | undefined>(undefined);

  useEffect(() => {
    getNextStep(sectionId).then(step => {
      setNextSectionId(step.nextSectionId);
      setNextChapterId(step.nextChapterId);
    });
  }, [sectionId]);

  useEffect(() => {
    const saveSectionProgress = async () => {
      const completed = percentage >= 70;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      let userId: string | null = user?.id || null;

      const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      const telegramUsername = window.Telegram?.WebApp?.initDataUnsafe?.user?.username || null;

      if (!userId && telegramId) {
        userId = await findOrCreateUserProfile(String(telegramId), telegramUsername);
      }

      if (userError || !userId || /^\d+$/.test(String(userId))) {
        console.error('❌ Ошибка получения пользователя или профиля');
        return;
      }

      if (!userId || /^\d+$/.test(userId)) {
        console.error('❌ Ошибка: userId не является UUID, прогресс не будет сохранён');
        return;
      }

      const upsertData = [
        {
          user_id: userId,
          section_id: sectionId,
          chapter_id: chapterId,
          accuracy: percentage,
          completed,
          updated_at: new Date().toISOString()
        }
      ];

      console.log('📦 upsert data:', upsertData[0]);

      const { error } = await supabase
        .from('user_progress')
        .upsert(upsertData, { onConflict: ['user_id', 'section_id'] });

      if (error) {
        console.error('Ошибка сохранения прогресса:', error);
      } else {
        console.log('Прогресс раздела успешно сохранён.');
      }
    };

    saveSectionProgress();
  }, []);

  if (accuracy < 0.7) {
    return <SectionFailed sectionId={String(sectionId)} onRetry={onRetry} />;
  }

  if (accuracy >= 0.7) {
    return (
      <SectionSuccess
        sectionId={String(sectionId)}
        nextSectionId={nextSectionId}
        nextChapterId={nextChapterId}
        onNext={() => onNext && onNext(nextSectionId, nextChapterId)}
      />
    );
  }

  return null;
};

export default SectionComplete;
