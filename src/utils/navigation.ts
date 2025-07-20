import { supabase } from '../services/supabaseClient.js'

export async function getNextStep(sectionId: number): Promise<{ nextSectionId?: string; nextChapterId?: string }> {
  const { data: current } = await supabase
    .from('sections')
    .select('id, chapter_id')
    .eq('id', sectionId)
    .maybeSingle()

  if (!current) return { }

  const { data: nextSection } = await supabase
    .from('sections')
    .select('id')
    .eq('chapter_id', current.chapter_id)
    .gt('id', sectionId)
    .order('id')
    .limit(1)
    .maybeSingle()

  if (nextSection) {
    return { nextSectionId: String(nextSection.id) }
  }

  const { data: nextChapter } = await supabase
    .from('chapters')
    .select('id')
    .gt('id', current.chapter_id)
    .order('id')
    .limit(1)
    .maybeSingle()

  return nextChapter ? { nextChapterId: String(nextChapter.id) } : {}
}
