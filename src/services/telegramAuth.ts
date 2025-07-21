import { supabase } from './supabaseClient';
import { telegramWebApp } from './telegramWebApp';

/**
 * Ensure that a profile record exists for the given user ID.
 * If the profile does not exist it will be created using the
 * provided Telegram user data.
 */
export async function ensureUserProfileExists(
  userId: string,
  telegramData: {
    id: number
    username?: string
    first_name?: string
    last_name?: string
    email?: string | null
  }
) {
  if (!userId) return;
  try {
    const { data: existing, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    if (!existing) {
      const username =
        telegramData.username ||
        `${telegramData.first_name || ''}${telegramData.last_name || ''}`;

      const { error: insertError } = await supabase.from('profiles').insert({
        id: userId,
        username,
        email: telegramData.email || null,
        telegram_id: String(telegramData.id),
        created_at: new Date().toISOString()
      });

      if (insertError) {
        console.error('❌ Ошибка создания профиля:', insertError);
      } else {
        console.log('✅ Профиль создан для пользователя', userId);
      }
    }
  } catch (err) {
    console.error('❌ Ошибка проверки профиля:', err);
  }
}

/**
 * Send Telegram init data to the backend for verification
 */
export async function verifyTelegramInitData(initData: string): Promise<boolean> {
  try {
    const res = await fetch('/api/verifyTelegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ initData })
    });

    if (!res.ok) return false;

    const result = await res.json();
    return !!result.ok;
  } catch (err) {
    console.error('❌ Verification request failed:', err);
    return false;
  }
}

export async function telegramLogin() {
  if (!window.Telegram?.WebApp) {
    console.error('Telegram SDK not initialized');
    return null;
  }

  const tg = window.Telegram.WebApp;
  const user = tg.initDataUnsafe?.user;
  if (!user) {
    console.warn('Telegram user data not found');
    telegramWebApp.openTelegramLink('https://t.me/EsperantoLetoBot/webapp');
    return null;
  }

  const verified = await verifyTelegramInitData(tg.initData);
  if (!verified) {
    await telegramWebApp.showAlert('Ошибка проверки Telegram данных');
    return null;
  }

  const telegramId = user.id.toString();
  const username = user.username || `${user.first_name}${user.last_name || ''}`;
  const email = `${telegramId}@telegram.local`;
  let authUserId = null;

  try {
    const { data: existing, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('telegram_id', telegramId)
      .maybeSingle();
    if (fetchError) throw fetchError;
    authUserId = existing?.id || crypto.randomUUID();
  } catch (err) {
    console.error('❌ Ошибка получения профиля Telegram:', err);
    return null;
  }

  await ensureUserProfileExists(authUserId, {
    id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    email: null
  });

  const { error: rpcError } = await supabase.rpc('create_user_from_telegram', {
    uid: authUserId,
    username: username || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
    email,
    telegram_id: telegramId
  });

  if (rpcError) {
    console.error('❌ Ошибка при сохранении профиля в Supabase:', rpcError.message);
  } else {
    console.log('✅ Профиль создан или обновлён через RPC');
  }

  localStorage.setItem('user_id', authUserId);
  localStorage.setItem('telegram_id', telegramId);
  return { id: authUserId, username, email };
}

export function getStoredUser() {
  const id = localStorage.getItem('user_id');
  return id ? { id } : null;
}
