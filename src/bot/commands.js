import { logger } from './utils/logger.js';
import { 
  formatChapterList, 
  formatSectionList, 
  formatUserProfile 
} from './utils/formatter.js';
import { 
  getMainMenuKeyboard, 
  getMainMenuInlineKeyboard,
  getChaptersKeyboard, 
  getSectionsKeyboard,
  getWebAppKeyboard
} from './utils/keyboard.js';
import { esperantoChapters } from './data/esperantoData.js';

const BOT_USERNAME = process.env.BOT_USERNAME || 'YOUR_BOT_USERNAME';

function buildWebAppUrl(params = {}) {
  const base = `https://t.me/${BOT_USERNAME}/webapp`;
  if (params && Object.keys(params).length > 0) {
    const search = new URLSearchParams(params);
    return `${base}?startapp=${encodeURIComponent(search.toString())}`;
  }
  return base;
}
import { 
  getUserState, 
  updateUserState, 
  getUserStats, 
  initializeUser 
} from './utils/userManager.js';

/**
 * Handle the /start command
 * ИСПРАВЛЕНО: Улучшенная обработка ошибок и логирование
 * @param {import("telegraf").Context & { message: import('@telegraf/types').Message.TextMessage }} ctx - Telegraf context
 */
export function handleStartCommand(ctx) {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  const firstName = ctx.from.first_name;
  
  console.log(`🚀 Обработка команды /start для пользователя ${userId} (${firstName})`);
  
  try {
    // КРИТИЧНО: Инициализируем пользователя с НУЛЕВЫМ прогрессом
    console.log(`📝 Инициализация пользователя ${userId}...`);
    
    const newUser = initializeUser(userId, {
      first_name: firstName,
      last_name: ctx.from.last_name,
      username: ctx.from.username,
      language_code: ctx.from.language_code
    });
    
    console.log(`✅ Пользователь ${userId} инициализирован с прогрессом: ${newUser.stats.progress}%`);
    
    // Устанавливаем начальное состояние
    updateUserState(userId, { currentState: 'browsing' });
    
    // Получаем статистику для логирования
    const stats = getUserStats(userId);
    console.log(`📊 Статистика пользователя ${userId}:`, {
      level: stats.level,
      progress: stats.progress,
      chaptersCompleted: stats.chaptersCompleted,
      testsCompleted: stats.testsCompleted
    });
    
    const welcomeMessage = `
🌟 *Saluton, ${firstName}!* 🌟

Добро пожаловать в бот для изучения эсперанто!

🚀 *Новинка!* Теперь вы можете использовать полнофункциональное веб-приложение прямо в Telegram!

*Что я могу:*
• 📚 Изучение языка по главам и разделам
• 🤖 AI-помощник для ответов на вопросы
• 📝 Интерактивные тесты и упражнения
• 📊 Отслеживание прогресса обучения
• 🌐 Полнофункциональное веб-приложение

*Ваш текущий прогресс:*
• Уровень: ${stats.level}
• Прогресс: ${stats.progress}%
• Завершено глав: ${stats.chaptersCompleted}
• Пройдено тестов: ${stats.testsCompleted}

*Выберите способ обучения:*
    `;
    
    console.log(`📤 Отправка приветственного сообщения пользователю ${userId}...`);
    
    ctx.telegram.sendMessage(chatId, welcomeMessage, { 
      parse_mode: 'Markdown',
      reply_markup: getMainMenuInlineKeyboard()
    }).then(() => {
      logger.info(`User ${firstName} (${userId}) started the bot - Progress: ${stats.progress}%, Level: ${stats.level}`);
      console.log(`✅ Приветственное сообщение отправлено пользователю ${userId} успешно`);
    }).catch(error => {
      logger.error(`Error sending start message to ${userId}:`, error);
      console.error(`❌ Ошибка отправки сообщения пользователю ${userId}:`, error);
      
      // Попытка отправить упрощенное сообщение
      ctx.telegram.sendMessage(chatId, `Привет, ${firstName}! Добро пожаловать в бот для изучения эсперанто! 🌟`).catch(fallbackError => {
        console.error(`❌ Критическая ошибка отправки сообщения ${userId}:`, fallbackError);
      });
    });
    
  } catch (error) {
    logger.error(`Error in handleStartCommand for user ${userId}:`, error);
    console.error(`❌ Критическая ошибка в handleStartCommand для пользователя ${userId}:`, error);
    
    // Отправляем сообщение об ошибке пользователю
    ctx.telegram.sendMessage(chatId, `❌ Произошла ошибка при инициализации. Попробуйте команду /start еще раз.

Если проблема повторяется, обратитесь к администратору.

Код ошибки: START_${Date.now()}`).catch(sendError => {
      console.error(`❌ Не удалось отправить сообщение об ошибке пользователю ${userId}:`, sendError);
    });
  }
}

/**
 * Handle the /help command
 * @param {import("telegraf").Context & { message: import('@telegraf/types').Message.TextMessage }} ctx - Telegraf context
 */
export function handleHelpCommand(ctx) {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  
  console.log(`📖 Обработка команды /help для пользователя ${userId}`);
  
  try {
    // Убеждаемся, что пользователь инициализирован
    getUserState(userId);
    
    const helpMessage = `
*🤖 Команды бота:*

/start - Начать изучение эсперанто
/help - Получить помощь
/test - Пройти тест на знание эсперанто
/chapters - Показать список глав
/profile - Мой профиль
/webapp - Открыть веб-приложение
/debug - Информация для отладки

*🌐 Веб-приложение:*
Нажмите кнопку "Открыть приложение" для доступа к полной версии с расширенными возможностями:
• Интерактивные уроки
• Продвинутый AI-чат
• Детальная статистика
• Адаптивный интерфейс

*📱 Как пользоваться ботом:*

1. Выберите главу из списка (/chapters)
2. Изучите теоретический материал
3. Пройдите практические задания
4. Проверьте свои знания в тесте

*🆘 Нужна помощь?*
Напишите "помощь" или используйте команду /help
    `;
    
    ctx.telegram.sendMessage(chatId, helpMessage, { 
      parse_mode: 'Markdown',
      reply_markup: getWebAppKeyboard()
    }).then(() => {
      logger.info(`User ${userId} requested help`);
      console.log(`✅ Справка отправлена пользователю ${userId}`);
    }).catch(error => {
      logger.error(`Error sending help message to ${userId}:`, error);
      console.error(`❌ Ошибка отправки справки пользователю ${userId}:`, error);
    });
    
  } catch (error) {
    logger.error(`Error in handleHelpCommand for user ${userId}:`, error);
    console.error(`❌ Ошибка в handleHelpCommand для пользователя ${userId}:`, error);
    ctx.telegram.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте еще раз.');
  }
}

/**
 * Handle the /webapp command
 * @param {import("telegraf").Context & { message: import('@telegraf/types').Message.TextMessage }} ctx - Telegraf context
 */
export function handleWebAppCommand(ctx) {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  
  console.log(`🌐 Обработка команды /webapp для пользователя ${userId}`);
  
  try {
    // Убеждаемся, что пользователь инициализирован
    getUserState(userId);

    ctx.telegram.sendMessage(chatId, 'Откройте мини-приложение:', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Открыть',
              web_app: {
                url: buildWebAppUrl()
              }
            }
          ]
        ]
      }
    }).then(() => {
      logger.info(`User ${userId} requested webapp`);
      console.log(`✅ WebApp сообщение отправлено пользователю ${userId}`);
    }).catch(error => {
      logger.error(`Error sending webapp message to ${userId}:`, error);
      console.error(`❌ Ошибка отправки WebApp сообщения пользователю ${userId}:`, error);
    });
    
  } catch (error) {
    logger.error(`Error in handleWebAppCommand for user ${userId}:`, error);
    console.error(`❌ Ошибка в handleWebAppCommand для пользователя ${userId}:`, error);
    ctx.telegram.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте еще раз.');
  }
}

/**
 * Handle the /chapters command
 * @param {import("telegraf").Context & { message: import('@telegraf/types').Message.TextMessage }} ctx - Telegraf context
 */
export function handleChaptersCommand(ctx) {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  
  console.log(`📚 Обработка команды /chapters для пользователя ${userId}`);
  
  try {
    // Убеждаемся, что пользователь инициализирован
    getUserState(userId);
    
    // Update user state
    updateUserState(userId, { 
      currentState: 'browsing_chapters',
      currentChapter: null,
      currentSection: null
    });
    
    // Format chapter list message
    const message = formatChapterList(esperantoChapters);
    
    // Send message with chapters keyboard
    ctx.telegram.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: getChaptersKeyboard(esperantoChapters)
    }).then(() => {
      logger.info(`User ${userId} requested chapters list`);
      console.log(`✅ Список глав отправлен пользователю ${userId}`);
    }).catch(error => {
      logger.error(`Error sending chapters list to ${userId}:`, error);
      console.error(`❌ Ошибка отправки списка глав пользователю ${userId}:`, error);
    });
    
  } catch (error) {
    logger.error(`Error in handleChaptersCommand for user ${userId}:`, error);
    console.error(`❌ Ошибка в handleChaptersCommand для пользователя ${userId}:`, error);
    ctx.telegram.sendMessage(chatId, '❌ Произошла ошибка при загрузке глав. Попробуйте еще раз.');
  }
}

/**
 * Handle the /test command
 * @param {import("telegraf").Context & { message: import('@telegraf/types').Message.TextMessage }} ctx - Telegraf context
 */
export function handleTestCommand(ctx) {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  
  console.log(`📝 Обработка команды /test для пользователя ${userId}`);
  
  try {
    // Убеждаемся, что пользователь инициализирован
    getUserState(userId);
    
    // Update user state
    updateUserState(userId, { 
      currentState: 'test_intro',
      quizAnswers: [],
      quizScore: 0
    });
    
    const testIntroMessage = `
*📝 Тест на знание эсперанто*

Этот тест поможет оценить ваш текущий уровень знания эсперанто.

📋 *Параметры теста:*
• Тест состоит из 10 вопросов
• На каждый вопрос дается 4 варианта ответа
• Выберите один правильный ответ
• В конце вы получите результаты и рекомендации

🌐 *Совет:* Для более комфортного прохождения теста используйте веб-приложение!

Готовы начать?
    `;
    
    ctx.telegram.sendMessage(chatId, testIntroMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🌐 Пройти в веб-приложении',
              web_app: {
                url: buildWebAppUrl()
              }
            }
          ],
          [
            { text: '▶️ Начать тест здесь', callback_data: 'start_test' }
          ],
          [
            { text: '🔙 Назад в меню', callback_data: 'back_to_menu' }
          ]
        ]
      }
    }).then(() => {
      logger.info(`User ${userId} requested test`);
      console.log(`✅ Тест сообщение отправлено пользователю ${userId}`);
    }).catch(error => {
      logger.error(`Error sending test intro to ${userId}:`, error);
      console.error(`❌ Ошибка отправки теста пользователю ${userId}:`, error);
    });
    
  } catch (error) {
    logger.error(`Error in handleTestCommand for user ${userId}:`, error);
    console.error(`❌ Ошибка в handleTestCommand для пользователя ${userId}:`, error);
    ctx.telegram.sendMessage(chatId, '❌ Произошла ошибка при загрузке теста. Попробуйте еще раз.');
  }
}

/**
 * Handle the /profile command
 * ИСПРАВЛЕНО: Показываем реальный прогресс пользователя
 * @param {import("telegraf").Context & { message: import('@telegraf/types').Message.TextMessage }} ctx - Telegraf context
 */
export function handleProfileCommand(ctx) {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  
  console.log(`👤 Обработка команды /profile для пользователя ${userId}`);
  
  try {
    // Убеждаемся, что пользователь инициализирован
    getUserState(userId);
    
    // Get user stats
    const stats = getUserStats(userId);
    console.log(`📊 Статистика пользователя ${userId}:`, stats);
    
    // Format profile message
    const profileMessage = formatUserProfile(ctx.from, stats);
    
    ctx.telegram.sendMessage(chatId, profileMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🌐 Открыть профиль в приложении',
              web_app: {
                url: buildWebAppUrl()
              }
            }
          ],
          [
            { text: '🔙 Назад в меню', callback_data: 'back_to_menu' }
          ]
        ]
      }
    }).then(() => {
      logger.info(`User ${userId} viewed profile - Progress: ${stats.progress}%, Chapters: ${stats.chaptersCompleted}, Tests: ${stats.testsCompleted}`);
      console.log(`✅ Профиль отправлен пользователю ${userId}`);
    }).catch(error => {
      logger.error(`Error sending profile to ${userId}:`, error);
      console.error(`❌ Ошибка отправки профиля пользователю ${userId}:`, error);
    });
    
  } catch (error) {
    logger.error(`Error in handleProfileCommand for user ${userId}:`, error);
    console.error(`❌ Ошибка в handleProfileCommand для пользователя ${userId}:`, error);
    ctx.telegram.sendMessage(chatId, '❌ Произошла ошибка при загрузке профиля. Попробуйте еще раз.');
  }
}

/**
 * Handle callback queries
 * @param {import("telegraf").Context & { callbackQuery: import('@telegraf/types').CallbackQuery.DataCallbackQuery }} ctx - Telegraf context
 */
export function handleCallbackQuery(ctx) {
  const callbackQuery = ctx.callbackQuery;
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;
  
  console.log(`🔘 Обработка callback query: ${data} от пользователя ${userId}`);
  
  try {
    // Answer the callback query
    ctx.answerCbQuery(callbackQuery.id);
    
    // Убеждаемся, что пользователь инициализирован
    getUserState(userId);
    
    switch (data) {
      case 'chapters':
        console.log(`📚 Переход к главам для пользователя ${userId}`);
        await handleChaptersCommand(ctx);
        break;
        
      case 'ai_help':
        console.log(`🤖 AI помощь для пользователя ${userId}`);
        const aiHelpMessage = `
*🤖 AI-помощник по эсперанто*

Я могу ответить на ваши вопросы об эсперанто и помочь с изучением языка.

🌐 *Рекомендация:* Для лучшего опыта общения с AI используйте веб-приложение с поддержкой голоса и расширенными возможностями!

Просто задайте вопрос, например:
• Как сказать "привет" на эсперанто?
• Объясни правило множественного числа
• Как спрягаются глаголы в настоящем времени?
        `;
        
        ctx.telegram.sendMessage(chatId, aiHelpMessage, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌐 AI-чат в приложении',
                  web_app: {
                    url: buildWebAppUrl()
                  }
                }
              ],
              [
                { text: '🔙 Назад в меню', callback_data: 'back_to_menu' }
              ]
            ]
          }
        });
        break;
        
      case 'test':
        console.log(`📝 Переход к тесту для пользователя ${userId}`);
        await handleTestCommand(ctx);
        break;
        
      case 'profile':
        console.log(`👤 Переход к профилю для пользователя ${userId}`);
        await handleProfileCommand(ctx);
        break;
        
      case 'start_test':
        console.log(`▶️ Начало теста для пользователя ${userId}`);
        // Start test in bot
        updateUserState(userId, { currentState: 'quiz' });
        ctx.telegram.sendMessage(chatId, '📝 Тест начинается...', {
          reply_markup: {
            keyboard: [
              [{ text: '🔙 Назад в меню' }]
            ],
            resize_keyboard: true
          }
        });
        break;
        
      case 'back_to_menu':
        console.log(`🔙 Возврат в меню для пользователя ${userId}`);
        await handleStartCommand(ctx);
        break;
        
      default:
        logger.warn(`Unknown callback data: ${data}`);
        console.log(`⚠️ Неизвестный callback data: ${data}`);
    }
    
    logger.info(`User ${userId} clicked callback: ${data}`);
    console.log(`✅ Callback query обработан: ${data} для пользователя ${userId}`);
    
  } catch (error) {
    logger.error(`Error in handleCallbackQuery for user ${userId}:`, error);
    console.error(`❌ Ошибка в handleCallbackQuery для пользователя ${userId}:`, error);
    ctx.answerCbQuery(callbackQuery.id, { text: '❌ Произошла ошибка' });
  }
}

/**
 * Handle chapter selection
 * @param {import("telegraf").Context & { message: import('@telegraf/types').Message.TextMessage }} ctx - Telegraf context
 * @param {number} chapterId - Selected chapter ID
 */
export function handleChapterSelection(ctx, chapterId) {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  
  console.log(`📖 Выбор главы ${chapterId} пользователем ${userId}`);
  
  try {
    // Убеждаемся, что пользователь инициализирован
    getUserState(userId);
    
    // Find selected chapter
    const chapter = esperantoChapters.find(ch => ch.id === chapterId);
    
    if (!chapter) {
      console.log(`❌ Глава ${chapterId} не найдена`);
      ctx.telegram.sendMessage(chatId, 'Глава не найдена. Пожалуйста, выберите главу из списка.');
      return;
    }
    
    // Update user state
    updateUserState(userId, { 
      currentState: 'browsing_sections',
      currentChapter: chapterId,
      currentSection: null
    });
    
    // Format section list message
    const message = formatSectionList(chapter);
    
    // Send message with sections keyboard and WebApp option
    ctx.telegram.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🌐 Изучать в приложении',
              web_app: {
                url: buildWebAppUrl({ chapter: chapterId })
              }
            }
          ],
          [
            { text: '📱 Продолжить в боте', callback_data: `chapter_${chapterId}` }
          ],
          [
            { text: '🔙 К списку глав', callback_data: 'chapters' }
          ]
        ]
      }
    }).then(() => {
      logger.info(`User ${userId} selected chapter ${chapterId}`);
      console.log(`✅ Глава ${chapterId} отправлена пользователю ${userId}`);
    }).catch(error => {
      logger.error(`Error sending chapter ${chapterId} to ${userId}:`, error);
      console.error(`❌ Ошибка отправки главы ${chapterId} пользователю ${userId}:`, error);
    });
    
  } catch (error) {
    logger.error(`Error in handleChapterSelection for user ${userId}:`, error);
    console.error(`❌ Ошибка в handleChapterSelection для пользователя ${userId}:`, error);
    ctx.telegram.sendMessage(chatId, '❌ Произошла ошибка при выборе главы. Попробуйте еще раз.');
  }
}

/**
 * Handle section selection
 * @param {import("telegraf").Context & { message: import('@telegraf/types').Message.TextMessage }} ctx - Telegraf context
 * @param {number} chapterId - Chapter ID
 * @param {number} sectionId - Selected section ID
 */
export function handleSectionSelection(ctx, chapterId, sectionId) {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  
  console.log(`📑 Выбор раздела ${chapterId}.${sectionId} пользователем ${userId}`);
  
  try {
    // Убеждаемся, что пользователь инициализирован
    getUserState(userId);
    
    // Find selected chapter and section
    const chapter = esperantoChapters.find(ch => ch.id === chapterId);
    
    if (!chapter) {
      console.log(`❌ Глава ${chapterId} не найдена`);
      ctx.telegram.sendMessage(chatId, 'Глава не найдена. Пожалуйста, выберите главу из списка.');
      return;
    }
    
    const section = chapter.sections.find(s => s.id === sectionId);
    
    if (!section) {
      console.log(`❌ Раздел ${sectionId} не найден в главе ${chapterId}`);
      ctx.telegram.sendMessage(chatId, 'Раздел не найден. Пожалуйста, выберите раздел из списка.');
      return;
    }
    
    // Update user state
    updateUserState(userId, { 
      currentState: 'viewing_section',
      currentChapter: chapterId,
      currentSection: sectionId
    });
    
    // Get section content
    const content = {
      title: section.title,
      content: `Теоретический материал для главы ${chapterId}, раздела ${sectionId} (${section.title}).\n\n🌐 *Рекомендация:* Для лучшего изучения материала откройте веб-приложение с интерактивными элементами!`,
      examples: [
        "Пример 1",
        "Пример 2", 
        "Пример 3"
      ]
    };
    
    // Send section content with WebApp option
    ctx.telegram.sendMessage(chatId, `
*📖 Глава ${chapterId}, Раздел ${sectionId}: ${section.title}*

${content.content}

*Примеры:*
• ${content.examples.join('\n• ')}
    `, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🌐 Изучать в приложении',
              web_app: {
                url: buildWebAppUrl({ chapter: chapterId, section: sectionId })
              }
            }
          ],
          [
            { text: '▶️ Практика', callback_data: `practice_${chapterId}_${sectionId}` }
          ],
          [
            { text: '🔙 К списку глав', callback_data: 'chapters' }
          ]
        ]
      }
    }).then(() => {
      logger.info(`User ${userId} selected section ${sectionId} in chapter ${chapterId}`);
      console.log(`✅ Раздел ${chapterId}.${sectionId} отправлен пользователю ${userId}`);
    }).catch(error => {
      logger.error(`Error sending section ${chapterId}.${sectionId} to ${userId}:`, error);
      console.error(`❌ Ошибка отправки раздела ${chapterId}.${sectionId} пользователю ${userId}:`, error);
    });
    
  } catch (error) {
    logger.error(`Error in handleSectionSelection for user ${userId}:`, error);
    console.error(`❌ Ошибка в handleSectionSelection для пользователя ${userId}:`, error);
    ctx.telegram.sendMessage(chatId, '❌ Произошла ошибка при выборе раздела. Попробуйте еще раз.');
  }
}
