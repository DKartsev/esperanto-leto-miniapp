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

    // Если подтверждение email отключено, сессия создается автоматически. В противном
    // случае она может быть null. Для вставки в таблицу с включенной RLS
    // необходима действующая сессия, иначе политика auth.uid() не пропустит запрос.
    let session = data.session
    if (!session) {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      session = signInData.session
    }

    const userId = session?.user?.id || data.user?.id
    if (!userId) throw new Error('Не удалось получить ID пользователя')

    // Создаём профиль пользователя после появления сессии, чтобы удовлетворить RLS
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
    if (error.code === 'invalid_credentials' || error.message === 'Invalid login credentials') {
      throw new Error('Неверный email или пароль')
    }
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
  const storedId = localStorage.getItem('user_id')
  if (storedId) {
    return { id: storedId }
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      if (error.message && error.message.includes('Auth session missing')) {
        return null
      }
      throw error
    }

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
