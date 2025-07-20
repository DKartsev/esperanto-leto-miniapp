import { FC, useEffect } from 'react';
import type { QuestionResultItem } from './QuestionInterface';
import { supabase } from '../services/supabaseClient.js';
import SectionFailed from './SectionFailed';
import SectionSuccess from './SectionSuccess';
import { getChapterById } from '../data/esperantoData';

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
}

const SectionComplete: FC<SectionCompleteProps> = ({
  results,
  chapterId,
  sectionId
}) => {
  const percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  const incorrectCount = results.incorrectAnswers.length;
  const accuracy = results.totalQuestions > 0 ? results.correctAnswers / results.totalQuestions : 0;

  const chapter = getChapterById(chapterId);
  const sectionIndex = chapter?.sections.findIndex(s => s.id === sectionId) ?? -1;
  const nextSection =
    chapter && sectionIndex >= 0 && sectionIndex + 1 < chapter.sections.length
      ? chapter.sections[sectionIndex + 1]
      : undefined;
  const nextSectionId = nextSection ? String(nextSection.id) : undefined;
  const nextChapter = nextSection ? undefined : getChapterById(chapterId + 1);
  const nextChapterId = nextChapter ? String(nextChapter.id) : undefined;

  useEffect(() => {
    const saveSectionProgress = async () => {
      const completed = percentage >= 70;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      let userId: string | null = user?.id || null;

      // Получаем Telegram ID из WebApp, если есть
      const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

      if (!userId && telegramId) {
        userId = String(telegramId);
      }

      if (userError || !userId) {
        console.error('Ошибка получения пользователя или Telegram ID:', userError);
        return;
      }

      // Если userId — это числовой Telegram ID, конвертируем в UUID из таблицы profiles
      if (/^\d+$/.test(userId)) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('telegram_id', String(userId))
          .maybeSingle();

        if (profileError) {
          console.error('Ошибка поиска профиля:', profileError);
        }

        if (profile?.id) {
          userId = profile.id as string;
        } else {
          console.warn('⚠️ UUID не найден, создаём профиль');

          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                telegram_id: String(userId),
                username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username || null
              }
            ])
            .select('id')
            .single();

          if (insertError || !newProfile) {
            console.error('❌ Ошибка создания нового профиля:', insertError);
            return;
          }

          userId = newProfile.id as string;
          console.log('✅ Профиль создан. UUID:', userId);
        }
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
    return <SectionFailed sectionId={String(sectionId)} />;
  }

  if (accuracy >= 0.7) {
    return (
      <SectionSuccess
        sectionId={String(sectionId)}
        nextSectionId={nextSectionId}
        nextChapterId={nextChapterId}
      />
    );
  }

  return null;
};

export default SectionComplete;
