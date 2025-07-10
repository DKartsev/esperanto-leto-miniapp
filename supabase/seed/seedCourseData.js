import { createClient } from '@supabase/supabase-js';
import esperantoData from '../../src/data/esperantoData.ts';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials are missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  for (const chapter of esperantoData) {
    const { data: chapterRow, error: chapterErr } = await supabase
      .from('chapters')
      .insert({
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        difficulty: chapter.difficulty,
        estimated_time: chapter.estimatedTime,
        prerequisites: chapter.prerequisites || null
      })
      .select()
      .single();
    if (chapterErr) throw chapterErr;

    for (const section of chapter.sections) {
      const { data: sectionRow, error: sectionErr } = await supabase
        .from('sections')
        .insert({
          id: section.id,
          chapter_id: chapterRow.id,
          title: section.title,
          description: section.description,
          duration: section.duration,
          prerequisites: section.prerequisites || null
        })
        .select()
        .single();
      if (sectionErr) throw sectionErr;

      for (const block of section.theoryBlocks) {
        const { error: tbErr } = await supabase.from('theory_blocks').insert({
          section_id: sectionRow.id,
          title: block.title,
          content: block.content,
          examples: block.examples,
          key_terms: block.keyTerms,
          practical_tips: block.practicalTips
        });
        if (tbErr) throw tbErr;
      }

      for (const q of section.questions) {
        const { error: qErr } = await supabase.from('questions').insert({
          section_id: sectionRow.id,
          type: q.type,
          question: q.question,
          options: q.options || null,
          correct_answer: q.correctAnswer,
          explanation: q.explanation,
          hints: q.hints,
          difficulty: q.difficulty
        });
        if (qErr) throw qErr;
      }
    }
  }
  console.log('Seeding complete');
}

seed().catch(err => {
  console.error('Seed failed', err);
  process.exit(1);
});
