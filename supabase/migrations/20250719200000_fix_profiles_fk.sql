-- Remove foreign key constraint from profiles to auth.users for Telegram login compatibility
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
