-- Add telegram_id column for Telegram login integration
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS telegram_id TEXT UNIQUE;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_telegram_id_idx ON profiles(telegram_id);

-- Update RPC to store telegram ID
CREATE OR REPLACE FUNCTION create_user_from_telegram(
  uid uuid,
  username text,
  email text,
  telegram_id text
) RETURNS void AS $$
BEGIN
  INSERT INTO users(id, created_at)
  VALUES (uid, timezone('utc', now()))
  ON CONFLICT DO NOTHING;

  INSERT INTO profiles(id, username, email, telegram_id, created_at, updated_at)
  VALUES (uid, username, email, telegram_id, timezone('utc', now()), timezone('utc', now()))
  ON CONFLICT (id) DO UPDATE
    SET updated_at = timezone('utc', now()),
        telegram_id = excluded.telegram_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
