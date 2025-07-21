export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

/**
 * Safely retrieve Telegram user from WebApp initDataUnsafe.
 * Logs warning if data is missing or malformed and returns null.
 */
export function getTelegramUser(): TelegramUser | null {
  const tgUser = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!tgUser || !tgUser.id) {
    console.warn('⚠️ Telegram user data is missing or invalid.');
    return null;
  }
  return {
    id: tgUser.id,
    first_name: tgUser.first_name,
    last_name: tgUser.last_name,
    username: tgUser.username,
    language_code: tgUser.language_code
  };
}
