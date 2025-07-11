import { supabase } from './supabaseClient.js'

/**
 * Регистрация нового пользователя
 * @param {string} email - Email пользователя
 * @param {string} password - Пароль
 * @param {string} username - Имя пользователя
 * @returns {Promise<Object>} Данные пользователя
 */
export async function signUp(email, password, username) {
  try {
    console.log('📝 Регистрация пользователя:', { email, username })
    
    // Регистрируем пользователя в Supabase Auth
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          username: username,
          display_name: username
        }
      }
    })
    
    if (error) throw error

    const userId = data.user?.id
    if (!userId) throw new Error('Не удалось получить ID пользователя')

    // Создаём профиль пользователя
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: userId, 
          username: username,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])

    if (profileError) {
      console.error('Ошибка создания профиля:', profileError)
      // Не бросаем ошибку, так как пользователь уже создан
    }

    console.log('✅ Пользователь зарегистрирован успешно')
    return data
  } catch (error) {
    console.error('❌ Ошибка регистрации:', error.message)
    throw new Error(`Ошибка регистрации: ${error.message}`)
  }
}

/**
 * Вход пользователя
 * @param {string} email - Email пользователя
 * @param {string} password - Пароль
 * @returns {Promise<Object>} Данные сессии
 */
export async function signIn(email, password) {
  try {
    console.log('🔐 Вход пользователя:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    console.log('✅ Вход выполнен успешно')
    return data
  } catch (error) {
    console.error('❌ Ошибка входа:', error.message)
    throw new Error(`Ошибка входа: ${error.message}`)
  }
}

/**
 * Выход пользователя
 * @returns {Promise<void>}
 */
export async function signOut() {
  try {
    console.log('🚪 Выход пользователя')
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    console.log('✅ Выход выполнен успешно')
  } catch (error) {
    console.error('❌ Ошибка выхода:', error.message)
    throw new Error(`Ошибка выхода: ${error.message}`)
  }
}

/**
 * Получить текущего пользователя
 * @returns {Promise<Object|null>} Данные пользователя или null
 */
export async function getCurrentUser() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    if (!session) return null

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error

    return user
  } catch (error) {
    console.error('❌ Ошибка получения пользователя:', error.message)
    return null
  }
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
      .single()
    
    if (error) throw error
    
    return data
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