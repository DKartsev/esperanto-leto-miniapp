import { supabase } from './supabaseClient'
import { getTelegramUser } from '../utils/telegram'

/**
 * Deterministically convert a Telegram numeric ID into a UUID using
 * the Web Crypto API. This avoids the Node `crypto` module which is not
 * available in the browser.
 *
 * @param {string|number} telegramId Telegram user id
 * @returns {Promise<string>} UUID derived from the id
 */
export async function telegramIdToUUID(telegramId: string | number): Promise<string> {
  const data = new TextEncoder().encode(String(telegramId))
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hex = hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32)

  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20)
  ].join('-')
}

// Телеграм-вход не требует регистрации через Supabase Auth

/**
 * Вход пользователя
 * @param {string} email - Email пользователя
 * @param {string} password - Пароль
 * @returns {Promise<Object>} Данные сессии
 */
// Раньше здесь был вход через Supabase Auth
export async function signIn(): Promise<void> {
  throw new Error('Email/пароль вход отключён')
}

/**
 * Выход пользователя
 * @returns {Promise<void>}
 */
export async function signOut() {
  console.log('🚪 Выход пользователя')
  localStorage.removeItem('user_id')
  localStorage.removeItem('telegram_id')
  console.log('✅ Выход выполнен успешно')
}

/**
 * Получить текущего пользователя
 * @returns {Promise<Object|null>} Данные пользователя или null
 */
export async function getCurrentUser() {
  const storedId = localStorage.getItem('user_id')
  if (storedId) {
    return { id: storedId }
  }

  const tgUser = getTelegramUser()
  if (tgUser?.id) {
    return { id: String(tgUser.id) }
  }

  return null
}

/**
 * Получить профиль пользователя
 * @param {string} userId - ID пользователя
 * @returns {Promise<Object|null>} Профиль пользователя
 */
export async function getUserProfile(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, telegram_id')
      .eq('id', userId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') throw error

    return data || null
  } catch (error: any) {
    console.error('❌ Ошибка получения профиля:', error.message)
    return null
  }
}

/**
 * Обновить профиль пользователя
 * @param {string} userId - ID пользователя
 * @param {Object} updates - Обновления профиля
 * @returns {Promise<Object>} Обновленный профиль
 */
export async function updateUserProfile(userId: string, updates: Record<string, any>): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    
    console.log('✅ Профиль обновлен успешно')
    return data
  } catch (error: any) {
    console.error('❌ Ошибка обновления профиля:', error.message)
    throw new Error(`Ошибка обновления профиля: ${error.message}`)
  }
}

/**
 * Ensure the user has a profile record in `profiles` table
 * @param {Object} user - Supabase user object
 */
export async function ensureUserProfile(user: any): Promise<void> {
  if (!user?.id) return
  try {
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, username, telegram_id')
      .eq('id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

    if (!existingProfile) {
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          username:
            user.user_metadata?.username ||
            user.email?.split('@')[0] ||
            'Без имени',
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])

      if (insertError) {
        console.error('❌ Ошибка при создании профиля:', insertError)
      } else {
        console.log('✅ Профиль создан для нового пользователя.')
      }
    } else {
      console.log('👤 Профиль уже существует.')
    }
  } catch (err) {
    console.error('❌ Ошибка при проверке/создании профиля:', err)
  }
}

/**
 * Find or create a user profile by Telegram ID
 * @param {string|number} telegramId
 * @param {string|null} username
 * @returns {Promise<string|null>} profile UUID or null
 */
export async function findOrCreateUserProfile(
  telegramId: string | number,
  username: string | null,
  firstName?: string | null,
  lastName?: string | null
): Promise<string | null> {
  const storedId = localStorage.getItem('user_id')

  // Проверяем профиль по telegram_id или сохраненному user_id
  const orFilter = storedId
    ? `telegram_id.eq.${telegramId},id.eq.${storedId}`
    : `telegram_id.eq.${telegramId}`

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .or(orFilter)
    .maybeSingle()

  if (existing?.id) {
    localStorage.setItem('user_id', existing.id)
    return existing.id
  }

  const uuid = storedId || crypto.randomUUID()

  await supabase.from('profiles').insert({
    id: uuid,
    username,
    first_name: firstName,
    last_name: lastName,
    telegram_id: String(telegramId),
    created_at: new Date().toISOString()
  })

  localStorage.setItem('user_id', uuid)
  return uuid
}

/**
 * Подписка на изменения аутентификации
 * @param {Function} callback - Функция обратного вызова
 * @returns {Object} Объект подписки
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Изменение состояния аутентификации:', event)
    callback(event, session)
  })
}

