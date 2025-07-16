import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import TelegramBot from 'node-telegram-bot-api';

// Import handlers
import { 
  handleStartCommand,
  handleHelpCommand,
  handleWebAppCommand,
  handleChaptersCommand,
  handleTestCommand,
  handleProfileCommand,
  handleCallbackQuery,
  handleChapterSelection,
  handleSectionSelection
} from './commands.js';

import { handleMessage } from './messageHandler.js';
import { logger } from './utils/logger.js';

// Enhanced validation and diagnostics
console.log('🔍 ЗАПУСК ДИАГНОСТИКИ БОТА...');
console.log('=' .repeat(50));

// Validate required environment variables
console.log('📋 Проверка переменных окружения:');
const requiredEnvVars = {
  'TELEGRAM_BOT_TOKEN': process.env.TELEGRAM_BOT_TOKEN,
  'BOT_USERNAME': process.env.BOT_USERNAME,
  'WEBAPP_URL': process.env.WEBAPP_URL
};

let hasErrors = false;
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value || value === 'your_token_here' || value === 'your_bot_username') {
    console.log(`❌ ${key}: НЕ УСТАНОВЛЕН или содержит placeholder`);
    hasErrors = true;
  } else {
    console.log(`✅ ${key}: Установлен`);
  }
}

if (hasErrors) {
  console.error('\n❌ КРИТИЧЕСКИЕ ОШИБКИ КОНФИГУРАЦИИ:');
  console.error('1. Проверьте файл .env в корне проекта');
  console.error('2. Убедитесь, что все переменные установлены корректно');
  console.error('3. Получите токен бота от @BotFather в Telegram');
  console.error('\nПример правильного .env файла:');
  console.error('TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxyz-1234567890');
  console.error('BOT_USERNAME=YourBotUsername');
  console.error('WEBAPP_URL=https://your-domain.com');
  process.exit(1);
}

const token = process.env.TELEGRAM_BOT_TOKEN.trim();
console.log(`🤖 Инициализация бота с токеном: ${token.substring(0, 10)}...`);

// Validate token format
const tokenPattern = /^\d+:[A-Za-z0-9_-]{35}$/;
if (!tokenPattern.test(token)) {
  console.error('❌ НЕВЕРНЫЙ ФОРМАТ ТОКЕНА БОТА');
  console.error('Ожидаемый формат: 123456789:ABCdefGHIjklMNOpqrSTUvwxyz-1234567890');
  process.exit(1);
}

// Create bot instance with enhanced error handling
let bot;
try {
  bot = new TelegramBot(token, { 
    polling: {
      interval: 300,
      autoStart: false, // Start manually after validation
      params: {
        timeout: 10,
        allowed_updates: ['message', 'callback_query', 'web_app_data']
      }
    }
  });
  console.log('✅ Экземпляр бота создан успешно');
} catch (error) {
  console.error('❌ Ошибка создания бота:', error);
  process.exit(1);
}

// Enhanced bot connection test with defensive programming
async function validateBotConnection() {
  console.log('\n🔗 Проверка подключения к Telegram API...');
  
  try {
    const botInfo = await bot.getMe();
    console.log('✅ Подключение к Telegram API успешно');
    console.log('📋 Информация о боте:', {
      id: botInfo.id,
      username: botInfo.username,
      first_name: botInfo.first_name,
      can_join_groups: botInfo.can_join_groups,
      can_read_all_group_messages: botInfo.can_read_all_group_messages,
      supports_inline_queries: botInfo.supports_inline_queries
    });
    
    // Check webhook status with defensive programming
    try {
      // Check if getWebhookInfo method exists before calling it
      if (typeof bot.getWebhookInfo === 'function') {
        const webhookInfo = await bot.getWebhookInfo();
        if (webhookInfo && webhookInfo.url) {
          console.log('⚠️ ВНИМАНИЕ: Webhook установлен:', webhookInfo.url);
          console.log('   Для polling режима нужно удалить webhook');
          
          // Check if deleteWebhook method exists before calling it
          if (typeof bot.deleteWebhook === 'function') {
            await bot.deleteWebhook();
            console.log('✅ Webhook удален автоматически');
          } else {
            console.log('⚠️ Метод deleteWebhook недоступен, webhook не удален');
          }
        } else {
          console.log('✅ Webhook не установлен (подходит для polling)');
        }
      } else {
        console.log('ℹ️ Метод getWebhookInfo недоступен, пропускаем проверку webhook');
        console.log('✅ Продолжаем с polling режимом');
      }
    } catch (webhookError) {
      console.log('⚠️ Не удалось проверить статус webhook:', webhookError.message);
      console.log('✅ Продолжаем с polling режимом');
    }
    
    logger.info(`Bot connected successfully: @${botInfo.username}`);
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к Telegram API:', error);
    console.error('\nВозможные причины:');
    console.error('1. Неверный токен бота');
    console.error('2. Бот заблокирован или удален в @BotFather');
    console.error('3. Проблемы с интернет-соединением');
    console.error('4. Telegram API временно недоступен');
    
    logger.error(`Failed to connect bot: ${error.message}`);
    return false;
  }
}

// Set bot commands with error handling
async function setupBotCommands() {
  const commands = [
    { command: 'start', description: 'Начать изучение эсперанто' },
    { command: 'help', description: 'Получить помощь' },
    { command: 'webapp', description: 'Открыть веб-приложение' },
    { command: 'test', description: 'Пройти тест на знание эсперанто' },
    { command: 'chapters', description: 'Показать список глав' },
    { command: 'profile', description: 'Мой профиль' },
    { command: 'debug', description: 'Информация для отладки' }
  ];

  try {
    await bot.setMyCommands(commands);
    console.log('✅ Команды бота установлены успешно');
    logger.info('Bot commands set successfully');
  } catch (error) {
    console.error('❌ Ошибка установки команд бота:', error);
    logger.error('Error setting bot commands:', error);
  }
}

// Enhanced command handlers with better error handling
bot.onText(/\/start/, async (msg) => {
  const userId = msg.from.id;
  const userName = msg.from.first_name;
  console.log(`📨 Получена команда /start от пользователя ${userId} (${userName})`);
  
  try {
    await handleStartCommand(bot, msg);
    console.log(`✅ Команда /start обработана успешно для пользователя ${userId}`);
  } catch (error) {
    console.error(`❌ Ошибка в команде /start для пользователя ${userId}:`, error);
    logger.error('Error in /start command:', error);
    
    // Send error message to user
    try {
      await bot.sendMessage(msg.chat.id, '❌ Произошла ошибка. Попробуйте еще раз через несколько секунд.');
    } catch (sendError) {
      console.error('❌ Не удалось отправить сообщение об ошибке:', sendError);
    }
  }
});

bot.onText(/\/help/, async (msg) => {
  console.log(`📨 Получена команда /help от пользователя ${msg.from.id}`);
  try {
    await handleHelpCommand(bot, msg);
  } catch (error) {
    console.error('❌ Ошибка в команде /help:', error);
    logger.error('Error in /help command:', error);
    bot.sendMessage(msg.chat.id, '❌ Произошла ошибка. Попробуйте еще раз.');
  }
});

bot.onText(/\/webapp/, async (msg) => {
  console.log(`📨 Получена команда /webapp от пользователя ${msg.from.id}`);
  try {
    await handleWebAppCommand(bot, msg);
  } catch (error) {
    console.error('❌ Ошибка в команде /webapp:', error);
    logger.error('Error in /webapp command:', error);
    bot.sendMessage(msg.chat.id, '❌ Произошла ошибка. Попробуйте еще раз.');
  }
});

bot.onText(/\/chapters/, async (msg) => {
  console.log(`📨 Получена команда /chapters от пользователя ${msg.from.id}`);
  try {
    await handleChaptersCommand(bot, msg);
  } catch (error) {
    console.error('❌ Ошибка в команде /chapters:', error);
    logger.error('Error in /chapters command:', error);
    bot.sendMessage(msg.chat.id, '❌ Произошла ошибка. Попробуйте еще раз.');
  }
});

bot.onText(/\/test/, async (msg) => {
  console.log(`📨 Получена команда /test от пользователя ${msg.from.id}`);
  try {
    await handleTestCommand(bot, msg);
  } catch (error) {
    console.error('❌ Ошибка в команде /test:', error);
    logger.error('Error in /test command:', error);
    bot.sendMessage(msg.chat.id, '❌ Произошла ошибка. Попробуйте еще раз.');
  }
});

bot.onText(/\/profile/, async (msg) => {
  console.log(`📨 Получена команда /profile от пользователя ${msg.from.id}`);
  try {
    await handleProfileCommand(bot, msg);
  } catch (error) {
    console.error('❌ Ошибка в команде /profile:', error);
    logger.error('Error in /profile command:', error);
    bot.sendMessage(msg.chat.id, '❌ Произошла ошибка. Попробуйте еще раз.');
  }
});

// Enhanced debug command
bot.onText(/\/debug/, async (msg) => {
  console.log(`📨 Получена команда /debug от пользователя ${msg.from.id}`);
  try {
    const botInfo = await bot.getMe();
    const debugInfo = `
🔧 *Диагностическая информация*

*Бот:*
• Статус: ✅ Работает
• ID: ${botInfo.id}
• Username: @${botInfo.username}
• Время запуска: ${new Date().toLocaleString('ru-RU')}

*Пользователь:*
• ID: ${msg.from.id}
• Имя: ${msg.from.first_name} ${msg.from.last_name || ''}
• Username: @${msg.from.username || 'не указан'}
• Язык: ${msg.from.language_code || 'не указан'}

*Чат:*
• ID: ${msg.chat.id}
• Тип: ${msg.chat.type}

*Система:*
• Node.js: ${process.version}
• Время сервера: ${new Date().toISOString()}
• WebApp URL: ${process.env.WEBAPP_URL || 'не настроен'}

*Последние команды работают:*
✅ /start, /help, /debug
    `;
    
    await bot.sendMessage(msg.chat.id, debugInfo, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('❌ Ошибка в команде /debug:', error);
    bot.sendMessage(msg.chat.id, '❌ Произошла ошибка в команде debug.');
  }
});

// Enhanced callback query handler
bot.on('callback_query', async (callbackQuery) => {
  console.log(`🔘 Получен callback query: ${callbackQuery.data} от пользователя ${callbackQuery.from.id}`);
  try {
    await handleCallbackQuery(bot, callbackQuery);
  } catch (error) {
    console.error('❌ Ошибка в callback query:', error);
    logger.error('Error in callback query:', error);
    bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Произошла ошибка' });
  }
});

// Enhanced WebApp data handler
bot.on('web_app_data', async (msg) => {
  console.log(`🌐 Получены данные WebApp от пользователя ${msg.from.id}`);
  try {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const webAppData = JSON.parse(msg.web_app.data);
    
    logger.info(`WebApp data received from user ${userId}:`, webAppData);
    
    // Handle different types of WebApp data
    switch (webAppData.type) {
      case 'test_completed':
        await bot.sendMessage(chatId, `
🎉 *Тест завершен!*

Ваш результат: *${webAppData.score}%*
Правильных ответов: ${webAppData.correct}/${webAppData.total}

${webAppData.score >= 80 ? '🏆 Отличный результат!' : 
  webAppData.score >= 60 ? '👍 Хороший результат!' : 
  '📚 Продолжайте изучение!'}
        `, { parse_mode: 'Markdown' });
        break;
        
      case 'chapter_completed':
        await bot.sendMessage(chatId, `
✅ *Глава ${webAppData.chapterId} завершена!*

Поздравляем с успешным завершением главы "${webAppData.chapterTitle}"!

Прогресс: ${webAppData.progress}%
        `, { parse_mode: 'Markdown' });
        break;
        
      default:
        console.log(`ℹ️ Неизвестный тип WebApp данных: ${webAppData.type}`);
    }
  } catch (error) {
    console.error('❌ Ошибка обработки WebApp данных:', error);
    logger.error('Error handling WebApp data:', error);
  }
});

// Handle chapter selection by number
bot.onText(/^([1-9]|1[0-4])$/, async (msg, match) => {
  console.log(`📖 Выбор главы ${match[1]} пользователем ${msg.from.id}`);
  try {
    const chapterId = parseInt(match[1]);
    await handleChapterSelection(bot, msg, chapterId);
  } catch (error) {
    console.error('❌ Ошибка выбора главы:', error);
    logger.error('Error in chapter selection:', error);
    bot.sendMessage(msg.chat.id, '❌ Произошла ошибка при выборе главы.');
  }
});

// Handle section selection (format: chapter.section, e.g., "1.2")
bot.onText(/^([1-9]|1[0-4])\.([1-5])$/, async (msg, match) => {
  console.log(`📑 Выбор раздела ${match[1]}.${match[2]} пользователем ${msg.from.id}`);
  try {
    const chapterId = parseInt(match[1]);
    const sectionId = parseInt(match[2]);
    await handleSectionSelection(bot, msg, chapterId, sectionId);
  } catch (error) {
    console.error('❌ Ошибка выбора раздела:', error);
    logger.error('Error in section selection:', error);
    bot.sendMessage(msg.chat.id, '❌ Произошла ошибка при выборе раздела.');
  }
});

// Handle all other messages
bot.on('message', async (msg) => {
  // Skip command messages and handled patterns
  if (msg.text && (
    msg.text.startsWith('/') || 
    /^([1-9]|1[0-4])$/.test(msg.text) ||
    /^([1-9]|1[0-4])\.([1-5])$/.test(msg.text)
  )) {
    return;
  }
  
  // Skip WebApp data messages
  if (msg.web_app) {
    return;
  }
  
  console.log(`💬 Получено сообщение от пользователя ${msg.from.id}: ${msg.text?.substring(0, 50)}...`);
  
  try {
    await handleMessage(bot, msg);
  } catch (error) {
    console.error('❌ Ошибка обработки сообщения:', error);
    logger.error('Error in message handler:', error);
    bot.sendMessage(msg.chat.id, '❌ Произошла ошибка при обработке сообщения.');
  }
});

// Enhanced error handling
bot.on('error', (error) => {
  console.error('❌ Критическая ошибка бота:', error);
  logger.error(`Bot error: ${error.message}`);
});

bot.on('polling_error', (error) => {
  console.error('❌ Ошибка polling:', error);
  logger.error(`Polling error: ${error.message}`);
  
  // Don't restart automatically to avoid infinite loops
  console.log('⚠️ Polling остановлен из-за ошибки. Перезапустите бота вручную.');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Получен сигнал SIGINT, завершение работы бота...');
  logger.info('Bot is shutting down...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Получен сигнал SIGTERM, завершение работы бота...');
  logger.info('Bot is shutting down...');
  bot.stopPolling();
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Необработанное исключение:', error);
  logger.error(`Uncaught exception: ${error.message}`);
  bot.stopPolling();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Необработанное отклонение промиса:', reason);
  logger.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
});

// Main initialization function
async function initializeBot() {
  console.log('\n🚀 ИНИЦИАЛИЗАЦИЯ БОТА...');
  
  // Step 1: Validate connection
  const isConnected = await validateBotConnection();
  if (!isConnected) {
    console.error('❌ Не удалось подключиться к Telegram API');
    process.exit(1);
  }
  
  // Step 2: Setup commands
  await setupBotCommands();
  
  // Step 3: Start polling
  try {
    await bot.startPolling();
    console.log('✅ Polling запущен успешно');
  } catch (error) {
    console.error('❌ Ошибка запуска polling:', error);
    process.exit(1);
  }
  
  // Success message
  console.log('\n' + '=' .repeat(50));
  console.log('🎉 TELEGRAM БОТ ЗАПУЩЕН УСПЕШНО!');
  console.log(`🤖 Имя бота: ${process.env.BOT_USERNAME || 'Не установлено'}`);
  console.log(`🌐 URL веб-приложения: ${process.env.WEBAPP_URL || 'Не настроен'}`);
  console.log(`⏰ Время запуска: ${new Date().toLocaleString('ru-RU')}`);
  console.log('📱 Бот готов к приему команд!');
  console.log('=' .repeat(50));
  
  logger.info('Telegram bot with WebApp integration started successfully');
}

// Start the bot
initializeBot().catch(error => {
  console.error('💥 Критическая ошибка инициализации:', error);
  process.exit(1);
});
