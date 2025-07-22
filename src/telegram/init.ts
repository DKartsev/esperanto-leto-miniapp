// Telegram WebApp initialization extracted from index.html

function detectTelegramWebApp() {
  const urlParams = new URLSearchParams(window.location.search)
  const isTelegramWebApp = (window as any).Telegram && (window as any).Telegram.WebApp
  const hasWebAppParams = urlParams.has('tgWebAppData') || urlParams.has('tgWebAppVersion')
  return isTelegramWebApp || hasWebAppParams
}

export function initTelegram() {
  if (!detectTelegramWebApp()) {
    const currentUrl = window.location.href
    const telegramUrl = `https://t.me/EsperantoLetoBot/webapp?startapp=${encodeURIComponent(currentUrl)}`
    if (confirm('Это приложение лучше работает в Telegram. Открыть в Telegram?')) {
      window.location.href = telegramUrl
      return
    }
  }

  if ((window as any).Telegram && (window as any).Telegram.WebApp) {
    const tg = (window as any).Telegram.WebApp
    tg.ready()
    tg.expand()
    tg.setHeaderColor('#059669')
    tg.enableClosingConfirmation()
    tg.onEvent('themeChanged', () => {
      document.body.className = 'tg-theme-' + tg.colorScheme
    })
    tg.onEvent('viewportChanged', () => {
      document.documentElement.style.setProperty('--tg-viewport-height', tg.viewportHeight + 'px')
      document.documentElement.style.setProperty('--tg-viewport-stable-height', tg.viewportStableHeight + 'px')
    })
    console.log('Telegram WebApp initialized:', {
      version: tg.version,
      platform: tg.platform,
      initData: tg.initData
    })
  }

  document.addEventListener('contextmenu', e => e.preventDefault())
  let lastTouchEnd = 0
  document.addEventListener(
    'touchend',
    event => {
      const now = new Date().getTime()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    },
    false
  )
}

initTelegram()
