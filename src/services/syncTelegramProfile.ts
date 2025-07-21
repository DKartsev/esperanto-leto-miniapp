import { supabase } from './supabaseClient'

export async function syncTelegramProfile(telegramUser: any) {
  if (!telegramUser?.id) return null

  const telegramId = telegramUser.id

  const { data: existing, error: searchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('telegram_id', telegramId)
    .single()

  if (searchError && searchError.code !== 'PGRST116') {
    console.warn('Ошибка при поиске профиля:', searchError.message)
    return null
  }

  if (existing) {
    return existing
  }

  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert({
      telegram_id: telegramId,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name || '',
      username: telegramUser.username || '',
      language_code: telegramUser.language_code || ''
    })
    .select()
    .single()

  if (insertError) {
    console.error('Ошибка при создании профиля:', insertError.message)
    return null
  }

  return created
}
