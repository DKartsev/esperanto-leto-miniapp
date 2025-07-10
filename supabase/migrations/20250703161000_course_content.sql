-- Migration to add course content tables

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT,
  estimated_time TEXT,
  prerequisites INTEGER[],
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Sections table
CREATE TABLE IF NOT EXISTS sections (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  prerequisites INTEGER[],
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Theory blocks
CREATE TABLE IF NOT EXISTS theory_blocks (
  id SERIAL PRIMARY KEY,
  section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  examples TEXT[],
  key_terms TEXT[],
  practical_tips TEXT[]
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
  type TEXT,
  question TEXT,
  options TEXT[],
  correct_answer TEXT,
  explanation TEXT,
  hints TEXT[],
  difficulty TEXT
);
