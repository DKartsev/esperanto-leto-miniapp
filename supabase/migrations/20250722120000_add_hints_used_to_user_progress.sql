-- Add hints_used column to user_progress table
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS hints_used INTEGER DEFAULT 0;

-- Update get_user_stats function to sum hints_used
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
    'total_hints_used', COALESCE(SUM(hints_used), 0),
    'completed_chapters', COUNT(DISTINCT chapter_id),
    'completed_sections', COUNT(DISTINCT CONCAT(chapter_id, '-', section_id)),
    'last_activity', MAX(answered_at)
  ) INTO result
  FROM user_progress
  WHERE user_id = user_uuid;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_chapter_progress function to sum hints_used
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
    'total_hints_used', COALESCE(SUM(hints_used), 0),
    'last_activity', MAX(answered_at)
  ) INTO result
  FROM user_progress
  WHERE user_id = user_uuid AND chapter_id = chapter_num;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refresh user_stats_view with hints_used
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
  COUNT(DISTINCT up.chapter_id) as completed_chapters,
  COUNT(DISTINCT CONCAT(up.chapter_id, '-', up.section_id)) as completed_sections,
  COALESCE(SUM(up.time_spent), 0) as total_time_spent,
  COALESCE(SUM(up.hints_used), 0) as total_hints_used,
  MAX(up.answered_at) as last_activity,
  p.created_at as registered_at
FROM profiles p
LEFT JOIN user_progress up ON p.id = up.user_id
GROUP BY p.id, p.username, p.created_at;

COMMENT ON COLUMN user_progress.hints_used IS 'Количество использованных подсказок';
