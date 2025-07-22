import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase не настроен. Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в .env файл'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .limit(1)

    if (error) throw error
    console.log('✅ Supabase подключен успешно')
    return true
  } catch (error: any) {
    console.error('❌ Ошибка подключения к Supabase:', error.message)
    return false
  }
}

