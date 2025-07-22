/**
 * Keyboard utilities for the Telegram bot
 */

const BOT_USERNAME = process.env.BOT_USERNAME || 'YOUR_BOT_USERNAME';

function buildWebAppUrl(params = {}) {
  const envUrl = process.env.WEBAPP_URL;
  const base = envUrl && envUrl.startsWith('https://')
    ? envUrl
    : `https://t.me/${BOT_USERNAME}/webapp`;

  if (params && Object.keys(params).length > 0) {
    const search = new URLSearchParams(params);
    const query = base.includes('?') ? `&${search.toString()}` : `?${search.toString()}`;
    return `${base}${query}`;
  }
  return base;
}

/**
 * Create main menu keyboard with WebApp button
 * @returns {Object} Keyboard markup
 */
export function getMainMenuKeyboard() {
  return {
    keyboard: [
      [{ text: '📚 Главы' }, { text: '🧠 AI-помощник' }],
      [{ text: '📝 Тест' }, { text: '👤 Мой профиль' }]
    ],
    resize_keyboard: true
  };
}

/**
 * Create main menu with inline WebApp button
 * @returns {Object} Inline keyboard markup
 */
export function getMainMenuInlineKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '🚀 Открыть приложение',
          web_app: {
            url: buildWebAppUrl()
          }
        }
      ],
      [
        { text: '📚 Главы', callback_data: 'chapters' },
        { text: '🧠 AI-помощник', callback_data: 'ai_help' }
      ],
      [
        { text: '📝 Тест', callback_data: 'test' },
        { text: '👤 Профиль', callback_data: 'profile' }
      ]
    ]
  };
}

/**
 * Create chapter selection keyboard
 * @param {Array} chapters - Array of chapter objects
 * @returns {Object} Keyboard markup
 */
export function getChaptersKeyboard(chapters) {
  const keyboard = [];
  const row = [];
  
  chapters.forEach((chapter, index) => {
    row.push({ text: `${chapter.id}. ${chapter.title.substring(0, 20)}` });
    
    if (row.length === 2 || index === chapters.length - 1) {
      keyboard.push([...row]);
      row.length = 0;
    }
  });
  
  keyboard.push([{ text: '🔙 Назад в меню' }]);
  
  return {
    keyboard,
    resize_keyboard: true
  };
}

/**
 * Create sections keyboard for a chapter
 * @param {number} chapterId - Chapter ID
 * @param {Array} sections - Array of section objects
 * @returns {Object} Keyboard markup
 */
export function getSectionsKeyboard(chapterId, sections) {
  const keyboard = sections.map(section => {
    return [{ text: `${section.id}. ${section.title}` }];
  });
  
  keyboard.push([{ text: '🔙 К списку глав' }]);
  
  return {
    keyboard,
    resize_keyboard: true
  };
}

/**
 * Create quiz options keyboard
 * @param {Array} options - Array of option strings
 * @returns {Object} Keyboard markup
 */
export function getQuizKeyboard(options) {
  const keyboard = options.map((option, index) => {
    return [{ text: `${String.fromCharCode(65 + index)}. ${option}` }];
  });
  
  return {
    keyboard,
    one_time_keyboard: true,
    resize_keyboard: true
  };
}

/**
 * Create practice keyboard
 * @returns {Object} Keyboard markup
 */
export function getPracticeKeyboard() {
  return {
    keyboard: [
      [{ text: '▶️ Начать практику' }],
      [{ text: '🔙 Назад к разделу' }]
    ],
    resize_keyboard: true
  };
}

/**
 * Create WebApp quick access keyboard
 * @returns {Object} Inline keyboard markup
 */
export function getWebAppKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '🌐 Открыть веб-приложение',
          web_app: {
            url: buildWebAppUrl()
          }
        }
      ]
    ]
  };
}
