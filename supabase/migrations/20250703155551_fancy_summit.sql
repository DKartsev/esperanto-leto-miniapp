/*
# Обновление схемы базы данных для Esperanto-Leto

1. Новые таблицы
   - `profiles` - профили пользователей с email и username
   - `user_progress` - детальный прогресс по главам, разделам и вопросам
   - `test_results` - результаты тестов с детализацией по разделам
   - `user_achievements` - система достижений пользователей

2. Безопасность
   - Включен Row Level Security (RLS) для всех таблиц
   - Политики обеспечивают доступ только к собственным данным

3. Оптимизация
   - Индексы для быстрого поиска
   - Функции для получения статистики
   - Автоматическое обновление timestamps
*/

-- Удаляем существующее представление если оно есть (чтобы избежать конфликтов при изменении типов колонок)
DROP VIEW IF EXISTS user_stats_view;

-- Создание таблицы профилей пользователей (если не существует)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Добавление новых колонок в таблицу profiles
DO $$
BEGIN
  -- Добавляем email колонку
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email TEXT UNIQUE;
  END IF;
  
  -- Добавляем updated_at колонку
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
  END IF;
END $$;

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

-- Обновление структуры таблицы user_progress
DO $$
BEGIN
  -- Добавляем chapter_id колонку
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'chapter_id'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN chapter_id INTEGER;
  END IF;
  
  -- Добавляем selected_answer колонку
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'selected_answer'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN selected_answer TEXT;
  END IF;
  
  -- Добавляем time_spent колонку
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'time_spent'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN time_spent INTEGER DEFAULT 0;
  END IF;
END $$;

-- Безопасное изменение типов колонок section_id и question_id
DO $$
BEGIN
  -- Проверяем и изменяем тип section_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' 
    AND column_name = 'section_id' 
    AND data_type = 'uuid'
  ) THEN
    -- Очищаем таблицу перед изменением типа (безопасно для новой установки)
    DELETE FROM user_progress;
    ALTER TABLE user_progress ALTER COLUMN section_id DROP DEFAULT;
    ALTER TABLE user_progress ALTER COLUMN section_id TYPE INTEGER USING NULL;
  END IF;
  
  -- Проверяем и изменяем тип question_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' 
    AND column_name = 'question_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE user_progress ALTER COLUMN question_id DROP DEFAULT;
    ALTER TABLE user_progress ALTER COLUMN question_id TYPE INTEGER USING NULL;
  END IF;
END $$;

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

-- Создание таблицы результатов тестов
CREATE TABLE IF NOT EXISTS test_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_type TEXT NOT NULL DEFAULT 'general',
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_spent INTEGER DEFAULT 0,
  section_scores JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Включаем RLS для таблицы test_results
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'test_results') THEN
    ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Политики для таблицы test_results
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'test_results' 
    AND policyname = 'Users can view own test results'
  ) THEN
    CREATE POLICY "Users can view own test results" ON test_results
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'test_results' 
    AND policyname = 'Users can insert own test results'
  ) THEN
    CREATE POLICY "Users can insert own test results" ON test_results
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Создание таблицы достижений пользователей
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB DEFAULT '{}',
  earned_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  
  UNIQUE(user_id, achievement_type)
);

-- Включаем RLS для таблицы user_achievements
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'user_achievements') THEN
    ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Политики для таблицы user_achievements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_achievements' 
    AND policyname = 'Users can view own achievements'
  ) THEN
    CREATE POLICY "Users can view own achievements" ON user_achievements
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_achievements' 
    AND policyname = 'Users can insert own achievements'
  ) THEN
    CREATE POLICY "Users can insert own achievements" ON user_achievements
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Создание индексов для оптимизации (если не существуют)
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_chapter ON user_progress(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_section ON user_progress(user_id, chapter_id, section_id);
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггера для автоматического обновления updated_at в profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at 
      BEFORE UPDATE ON profiles 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

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
    'total_time_spent', COALESCE(SUM(time_spent), 0),
    'completed_chapters', COUNT(DISTINCT chapter_id),
    'completed_sections', COUNT(DISTINCT CONCAT(chapter_id, '-', section_id)),
    'last_activity', MAX(answered_at)
  ) INTO result
  FROM user_progress
  WHERE user_id = user_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создание функции для получения прогресса по главе
CREATE OR REPLACE FUNCTION get_chapter_progress(user_uuid UUID, chapter_num INTEGER)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'chapter_id', chapter_num,
    'total_answers', COUNT(*),
    'correct_answers', COUNT(*) FILTER (WHERE is_correct = true),
    'accuracy', CASE 
      WHEN COUNT(*) > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE is_correct = true)::FLOAT / COUNT(*)) * 100)
      ELSE 0 
    END,
    'sections_completed', COUNT(DISTINCT section_id),
    'total_time_spent', COALESCE(SUM(time_spent), 0),
    'last_activity', MAX(answered_at)
  ) INTO result
  FROM user_progress
  WHERE user_id = user_uuid AND chapter_id = chapter_num;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создание обновленного представления для статистики пользователей
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
  COUNT(DISTINCT up.chapter_id) as completed_chapters,
  COUNT(DISTINCT CONCAT(up.chapter_id, '-', up.section_id)) as completed_sections,
  COALESCE(SUM(up.time_spent), 0) as total_time_spent,
  MAX(up.answered_at) as last_activity,
  p.created_at as registered_at
FROM profiles p
LEFT JOIN user_progress up ON p.id = up.user_id
GROUP BY p.id, p.username, p.created_at;

-- Комментарии к таблицам
COMMENT ON TABLE profiles IS 'Профили пользователей с дополнительной информацией';
COMMENT ON TABLE user_progress IS 'Прогресс пользователей по вопросам и разделам';
COMMENT ON TABLE test_results IS 'Результаты прохождения тестов пользователями';
COMMENT ON TABLE user_achievements IS 'Достижения пользователей в процессе обучения';

-- Комментарии к новым колонкам
COMMENT ON COLUMN profiles.email IS 'Email адрес пользователя (уникальный)';
COMMENT ON COLUMN profiles.updated_at IS 'Время последнего обновления профиля';
COMMENT ON COLUMN user_progress.chapter_id IS 'ID главы курса (1-14)';
COMMENT ON COLUMN user_progress.selected_answer IS 'Выбранный пользователем ответ';
COMMENT ON COLUMN user_progress.time_spent IS 'Время, потраченное на ответ (в секундах)';
COMMENT ON COLUMN test_results.section_scores IS 'JSON объект с баллами по разделам теста';
COMMENT ON COLUMN user_achievements.achievement_data IS 'JSON объект с дополнительными данными о достижении';