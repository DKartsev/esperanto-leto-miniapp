import { useEffect, useState } from 'react'

export function useTelegramUser() {
  const [telegramUser, setTelegramUser] = useState<any>(null)

  useEffect(() => {
    if (window?.Telegram?.WebApp?.initDataUnsafe?.user) {
      setTelegramUser(window.Telegram.WebApp.initDataUnsafe.user)
    }
  }, [])

  return telegramUser
}

export default useTelegramUser
