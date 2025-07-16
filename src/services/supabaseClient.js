import { createClient } from '@supabase/supabase-js'

// Конфигурация Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase не настроен. Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env файл')
}

// Создаем клиент Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Проверка подключения
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) throw error
    console.log('✅ Supabase подключен успешно')
    return true
  } catch (error) {
    console.error('❌ Ошибка подключения к Supabase:', error.message)
    return false
  }
}

// Инициализация при загрузке
checkConnection()
