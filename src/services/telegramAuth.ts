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
  const email = `${username}@telegram.fake`;
  const userUUID = uuidv5(telegramId, TELEGRAM_NAMESPACE);

  const { error } = await supabase.rpc('create_user_from_telegram', {
    uid: userUUID,
    username,
    email,
  });

  if (error) {
    console.error('\u274C \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0438 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F:', error);
  }

  localStorage.setItem('user_id', userUUID);
  return { id: userUUID, username, email };
}

export function getStoredUser() {
  const id = localStorage.getItem('user_id');
  return id ? { id } : null;
}
