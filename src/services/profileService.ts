import { supabase } from './supabaseClient.js';

export interface TelegramUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Create profile for Telegram user if it does not exist and return the profile.
 */
export async function createOrGetProfile(user: TelegramUser) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id.toString(),
        username: user.username ?? `${user.first_name ?? ''}${user.last_name ?? ''}`,
        email: `${user.username ?? user.id}@telegram`,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) {
    console.error('createOrGetProfile error:', error);
  }

  return data;
}
