-- Add unique index on (user_id, question_id) for user_progress
CREATE UNIQUE INDEX IF NOT EXISTS user_progress_user_question_idx
  ON user_progress(user_id, question_id);
