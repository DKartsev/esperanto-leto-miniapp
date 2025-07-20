import { supabase } from './supabaseClient.js'
export * from './progressService.js'

export async function updateChapterProgress(
  userId: string,
  chapterId: number
): Promise<void> {
  // Получаем список разделов главы
  const { data: sections, error: sectionError } = await supabase
    .from('sections')
    .select('id')
    .eq('chapter_id', chapterId)

  if (sectionError || !sections) return

  const { data: progressData, error: progressError } = await supabase
    .from('user_progress')
    .select('section_id, completed, accuracy, time_spent')
    .eq('user_id', userId)
    .eq('chapter_id', chapterId)

  if (progressError || !progressData) return

  const completedSections = progressData.filter((p) => p.completed).length
  const allSectionsCompleted = completedSections === sections.length

  const avgAccuracy =
    progressData.length > 0
      ? Math.round(
          progressData.reduce((sum, row) => sum + (row.accuracy || 0), 0) /
            progressData.length
        )
      : 0

  const totalTime = progressData.reduce(
    (sum, row) => sum + (row.time_spent || 0),
    0
  )

  await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      chapter_id: chapterId,
      section_id: null,
      completed: allSectionsCompleted,
      accuracy: avgAccuracy,
      time_spent: totalTime
    },
    { onConflict: ['user_id', 'chapter_id', 'section_id'] }
  )

  await supabase.from('user_chapter_progress').upsert(
    {
      user_id: userId,
      chapter_id: chapterId,
      completed: allSectionsCompleted,
      average_accuracy: avgAccuracy,
      total_time: totalTime
    },
    { onConflict: 'user_id, chapter_id' }
  )
}
