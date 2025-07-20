import { supabase } from './supabaseClient.js';
import { telegramWebApp } from './telegramWebApp';

const PASSWORD_SUFFIX = '_tg';


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
  const password = telegramId + PASSWORD_SUFFIX;

  let authUserId = null;

  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpError && !signUpError.message.includes('User already registered')) {
      throw signUpError;
    }

    if (signUpData?.user) {
      authUserId = signUpData.user.id;
    } else {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      authUserId = signInData.user.id;
    }
  } catch (err) {
    console.error('❌ Ошибка входа через Supabase:', err);
  }

  if (!authUserId) {
    console.warn('Supabase auth user not created');
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: authUserId,
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

  localStorage.setItem('user_id', authUserId);
  localStorage.setItem('user_email', email);
  localStorage.setItem('user_password', password);
  localStorage.setItem('telegram_id', telegramId);
  return { id: authUserId, username, email };
}

export function getStoredUser() {
  const id = localStorage.getItem('user_id');
  return id ? { id } : null;
}
