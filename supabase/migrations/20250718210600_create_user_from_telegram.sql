-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Function to create user from Telegram ID
create or replace function create_user_from_telegram(
  uid uuid,
  username text,
  email text
) returns void as $$
begin
  insert into users(id, created_at)
  values (uid, timezone('utc', now()))
  on conflict do nothing;

  insert into profiles(id, username, email, created_at, updated_at)
  values (uid, username, email, timezone('utc', now()), timezone('utc', now()))
  on conflict(id) do update
    set updated_at = timezone('utc', now());
end;
$$ language plpgsql security definer;
