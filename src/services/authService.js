import { supabase } from './supabaseClient.js'

// Телеграм-вход не требует регистрации через Supabase Auth

/**
 * Вход пользователя
 * @param {string} email - Email пользователя
 * @param {string} password - Пароль
 * @returns {Promise<Object>} Данные сессии
 */
// Раньше здесь был вход через Supabase Auth
export async function signIn(_email, _password) {
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

  const tgId = window?.Telegram?.WebApp?.initDataUnsafe?.user?.id
  if (tgId) {
    return { id: String(tgId) }
  }

  return null
}

/**
 * Получить профиль пользователя
 * @param {string} userId - ID пользователя
 * @returns {Promise<Object|null>} Профиль пользователя
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') throw error

    return data || null
  } catch (error) {
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
export async function updateUserProfile(userId, updates) {
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
  } catch (error) {
    console.error('❌ Ошибка обновления профиля:', error.message)
    throw new Error(`Ошибка обновления профиля: ${error.message}`)
  }
}

/**
 * Ensure the user has a profile record in `profiles` table
 * @param {Object} user - Supabase user object
 */
export async function ensureUserProfile(user) {
  if (!user?.id) return
  try {
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
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
export async function findOrCreateUserProfile(telegramId, username = null) {
  if (!telegramId) return null
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('telegram_id', String(telegramId))
      .maybeSingle()

    if (profileError) throw profileError

    if (profile?.id) {
      return profile.id
    }

    const email = `${telegramId}@telegram.local`
    const authUserId = crypto.randomUUID()

    const { error: rpcError } = await supabase.rpc('create_user_from_telegram', {
      uid: authUserId,
      username: username || 'User',
      email,
      telegram_id: String(telegramId)
    })

    if (rpcError) throw rpcError

    localStorage.setItem('user_id', authUserId)
    localStorage.setItem('telegram_id', String(telegramId))

    return authUserId
  } catch (err) {
    console.error('❌ Ошибка поиска/создания профиля Telegram:', err)
    return null
  }
}

/**
 * Подписка на изменения аутентификации
 * @param {Function} callback - Функция обратного вызова
 * @returns {Object} Объект подписки
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔄 Изменение состояния аутентификации:', event)
    callback(event, session)
  })
}

