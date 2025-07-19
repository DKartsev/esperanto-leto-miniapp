import { supabase } from './supabaseClient';

export async function updateChapterProgress(userId: string, chapterId: number) {
  // Получаем все разделы этой главы
  const { data: sections, error: sectionError } = await supabase
    .from('sections')
    .select('id')
    .eq('chapter_id', chapterId);

  if (sectionError || !sections) return;

  const sectionIds = sections.map((s) => s.id);

  // Получаем прогресс пользователя по всем разделам этой главы
  const { data: progressData, error: progressError } = await supabase
    .from('user_progress')
    .select('section_id, completed')
    .eq('user_id', userId)
    .in('section_id', sectionIds);

  if (progressError || !progressData) return;

  const completedSections = progressData.filter((p) => p.completed).length;
  const allSectionsCompleted = completedSections === sectionIds.length;

  // Обновим user_progress: создадим/обновим запись с section_id = null
  const { error: upsertError } = await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      chapter_id: chapterId,
      section_id: null,
      completed: allSectionsCompleted,
      accuracy: null,
      time_spent: null
    },
    {
      onConflict: ['user_id', 'chapter_id', 'section_id']
    }
  );

  return upsertError;
}
