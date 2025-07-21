import { supabase } from './supabaseClient'

export async function fetchChapters() {
  const { data, error } = await supabase
    .from('chapters')
    .select('id, title')
    .order('id')

  if (error) throw error
  return data || []
}

export async function fetchSections(chapterId: number) {
  const { data, error } = await supabase
    .from('sections')
    .select('id, title')
    .eq('chapter_id', chapterId)
    .order('id')

  if (error) throw error
  return data || []
}

export async function fetchTheoryBlocks(sectionId: number) {
  const { data, error } = await supabase
    .from('theory_blocks')
    .select('id, title, content, examples, key_terms')
    .eq('section_id', sectionId)
    .order('id')

  if (error) {
    console.error('Ошибка загрузки теории:', error.message)
    throw error
  }

  if (!data || data.length === 0) {
    console.warn('Данные theory_blocks не найдены для section_id', sectionId)
    return []
  }

  return data.map(block => ({
    ...block,
    examples:
      typeof block.examples === 'string'
        ? JSON.parse(block.examples)
        : block.examples || [],
    key_terms:
      typeof block.key_terms === 'string'
        ? JSON.parse(block.key_terms)
        : block.key_terms || []
  }))
}

export async function fetchQuestions(sectionId: number) {
  const { data, error } = await supabase
    .from('questions')
    .select(
      'id, type, question, options, correct_answer, explanation, hints, difficulty'
    )
    .eq('section_id', sectionId)
    .order('id')

  if (error) {
    console.error('Ошибка загрузки вопросов:', error.message)
    throw error
  }

  if (!data || data.length === 0) {
    console.warn('Данные questions не найдены для section_id', sectionId)
    return []
  }

  return data.map(q => ({
    ...q,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options || [],
    hints: typeof q.hints === 'string' ? JSON.parse(q.hints) : q.hints || []
  }))
}
