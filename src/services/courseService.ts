import { supabase } from './supabaseClient.js';

export interface TheoryBlock {
  id: number;
  section_id: number;
  title: string;
  content: string;
  examples: string[];
  key_terms: string[];
  practical_tips: string[];
}

export interface Question {
  id: number;
  section_id: number;
  type: string;
  question: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  hints: string[];
  difficulty: string;
}

export interface Section {
  id: number;
  chapter_id: number;
  title: string;
  description: string;
  duration: string;
  theory_blocks?: TheoryBlock[];
  questions?: Question[];
}

export interface Chapter {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimated_time: string;
  sections?: Section[];
}

export async function fetchCourseData(): Promise<Chapter[]> {
  const { data, error } = await supabase
    .from('chapters')
    .select('*, sections(*, theory_blocks(*), questions(*))')
    .order('id');
  if (error) throw error;
  return data || [];
}

export async function fetchChapters(): Promise<Chapter[]> {
  const { data, error } = await supabase.from('chapters').select('*').order('id');
  if (error) throw error;
  return data || [];
}

export async function fetchChapter(id: number): Promise<Chapter | null> {
  const { data, error } = await supabase
    .from('chapters')
    .select('*, sections(id,title,description,duration)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function fetchSections(chapterId: number): Promise<Section[]> {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('id');
  if (error) throw error;
  return data || [];
}

export async function fetchSection(chapterId: number, sectionId: number): Promise<Section | null> {
  const { data, error } = await supabase
    .from('sections')
    .select('*, theory_blocks(*), questions(*)')
    .eq('chapter_id', chapterId)
    .eq('id', sectionId)
    .single();
  if (error) return null;
  return data;
}

