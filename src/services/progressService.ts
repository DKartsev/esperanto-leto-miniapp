import { supabase } from './supabaseClient.js'

export async function updateChapterProgress(user_id: string, chapter_id: number): Promise<void> {
  const { data: allSections } = await supabase
    .from('sections')
    .select('id')
    .eq('chapter_id', chapter_id)

  if (!allSections) return

  const { data: completedSections } = await supabase
    .from('user_progress')
    .select('section_id')
    .eq('user_id', user_id)
    .eq('chapter_id', chapter_id)
    .eq('completed', true)

  if (!completedSections) return

  if (completedSections.length === allSections.length) {
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('accuracy, time_spent')
      .eq('user_id', user_id)
      .eq('chapter_id', chapter_id)

    if (!progressData || progressData.length === 0) return

    const avgAccuracy = Math.round(
      progressData.reduce((sum: number, row: any) => sum + row.accuracy, 0) / progressData.length
    )
    const totalTime = progressData.reduce((sum: number, row: any) => sum + row.time_spent, 0)

    await supabase
      .from('user_chapter_progress')
      .upsert(
        {
          user_id,
          chapter_id,
          completed: true,
          average_accuracy: avgAccuracy,
          total_time: totalTime
        },
        { onConflict: ['user_id', 'chapter_id'] }
      )
  }
}
