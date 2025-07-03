/*
# Esperanto-Leto Database Schema

1. New Tables
   - `profiles` - User profiles with username and creation date
   - `user_progress` - User learning progress tracking

2. Security
   - Enable RLS on both tables
   - Add policies for users to manage their own data

3. Functions and Views
   - `get_user_stats()` function for user statistics
   - `user_stats_view` for convenient data access

4. Indexes
   - Optimized indexes for user progress queries
*/

-- Создание таблицы профилей пользователей (если не существует)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Включаем RLS для таблицы profiles (если еще не включен)
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'profiles') THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Создание политики для profiles (если не существует)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Allow users to manage their own profiles'
  ) THEN
    CREATE POLICY "Allow users to manage their own profiles" ON profiles
      FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Создание таблицы прогресса пользователей (если не существует)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  section_id UUID,
  question_id UUID,
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Добавление внешнего ключа для user_progress (если не существует)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_progress_user_id_fkey'
    AND table_name = 'user_progress'
  ) THEN
    ALTER TABLE user_progress 
    ADD CONSTRAINT user_progress_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Включаем RLS для таблицы user_progress (если еще не включен)
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'user_progress') THEN
    ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Создание политики для user_progress (если не существует)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_progress' 
    AND policyname = 'Allow users to manage their own progress'
  ) THEN
    CREATE POLICY "Allow users to manage their own progress" ON user_progress
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Создание индексов (если не существуют)
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_section ON user_progress(user_id, section_id);

-- Создание функции для получения статистики пользователя
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_answers', COUNT(*),
    'correct_answers', COUNT(*) FILTER (WHERE is_correct = true),
    'accuracy', CASE 
      WHEN COUNT(*) > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE is_correct = true)::FLOAT / COUNT(*)) * 100)
      ELSE 0 
    END,
    'completed_sections', COUNT(DISTINCT section_id),
    'last_activity', MAX(answered_at)
  ) INTO result
  FROM user_progress
  WHERE user_id = user_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Удаление существующего представления (если существует) и создание нового
DROP VIEW IF EXISTS user_stats_view;

CREATE VIEW user_stats_view AS
SELECT 
  p.id as user_id,
  p.username,
  COUNT(up.id) as total_answers,
  COUNT(up.id) FILTER (WHERE up.is_correct = true) as correct_answers,
  CASE 
    WHEN COUNT(up.id) > 0 
    THEN ROUND((COUNT(up.id) FILTER (WHERE up.is_correct = true)::FLOAT / COUNT(up.id)) * 100)
    ELSE 0 
  END as accuracy,
  COUNT(DISTINCT up.section_id) as completed_sections,
  MAX(up.answered_at) as last_activity,
  p.created_at as registered_at
FROM profiles p
LEFT JOIN user_progress up ON p.id = up.user_id
GROUP BY p.id, p.username, p.created_at;

-- Комментарии к таблицам
COMMENT ON TABLE profiles IS 'Профили пользователей с дополнительной информацией';
COMMENT ON TABLE user_progress IS 'Прогресс пользователей по вопросам и разделам';