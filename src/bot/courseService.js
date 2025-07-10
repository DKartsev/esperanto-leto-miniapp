import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function fetchChapters() {
  const { data, error } = await supabase.from('chapters').select('id,title').order('id');
  if (error) throw error;
  return data || [];
}

export async function fetchChapter(chapterId) {
  const { data, error } = await supabase
    .from('chapters')
    .select('id,title, sections(id,title)')
    .eq('id', chapterId)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchSection(chapterId, sectionId) {
  const { data, error } = await supabase
    .from('sections')
    .select('id,title')
    .eq('chapter_id', chapterId)
    .eq('id', sectionId)
    .single();
  if (error) throw error;
  return data;
}
