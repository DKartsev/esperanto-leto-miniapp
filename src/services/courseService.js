import { supabase } from './supabaseClient.js'

export async function fetchChapters() {
  const { data, error } = await supabase
    .from('chapters')
    .select('id, title')
    .order('id')

  if (error) throw error
  return data || []
}

export async function fetchSections(chapterId) {
  const { data, error } = await supabase
    .from('sections')
    .select('id, title')
    .eq('chapter_id', chapterId)
    .order('id')

  if (error) throw error
  return data || []
}

export async function fetchTheoryBlocks(sectionId) {
  const { data, error } = await supabase
    .from('theory_blocks')
    .select('id, content')
    .eq('section_id', sectionId)
    .order('id')

  if (error) throw error
  return data || []
}

export async function fetchQuestionsWithAnswers(sectionId) {
  const { data, error } = await supabase
    .from('questions')
    .select('id, text, hint, answers (id, text, is_correct)')
    .eq('section_id', sectionId)
    .order('id')

  if (error) throw error
  return data || []
}
