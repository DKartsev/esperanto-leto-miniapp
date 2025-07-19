import { supabase } from './supabaseClient.js';
import { v5 as uuidv5 } from 'uuid';
import { telegramWebApp } from './telegramWebApp';

const TELEGRAM_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

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

  const telegramId = user.id.toString();
  const username = user.username || `${user.first_name}${user.last_name || ''}`;
  const email = `${telegramId}@telegram.local`;
  const userUUID = uuidv5(telegramId, TELEGRAM_NAMESPACE);

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userUUID,
        telegram_id: telegramId,
        username: username || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email
      },
      {
        onConflict: ['telegram_id']
      }
    );

  if (error) {
    console.error('❌ Ошибка при сохранении профиля в Supabase:', error.message);
  } else {
    console.log('✅ Профиль создан или обновлён:', data);
  }

  localStorage.setItem('user_id', userUUID);
  return { id: userUUID, username, email };
}

export function getStoredUser() {
  const id = localStorage.getItem('user_id');
  return id ? { id } : null;
}
