#!/usr/bin/env node

// Главный скрипт запуска для Esperanto-Leto платформы
import ProcessManager from './src/bot/process-manager.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем переменные окружения
dotenv.config();

// ASCII Art для красивого запуска
const asciiArt = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    ███████╗███████╗██████╗ ███████╗██████╗  █████╗ ███╗   ██╗ ║
║    ██╔════╝██╔════╝██╔══██╗██╔════╝██╔══██╗██╔══██╗████╗  ██║ ║
║    █████╗  ███████╗██████╔╝█████╗  ██████╔╝███████║██╔██╗ ██║ ║
║    ██╔══╝  ╚════██║██╔═══╝ ██╔══╝  ██╔══██╗██╔══██║██║╚██╗██║ ║
║    ███████╗███████║██║     ███████╗██║  ██║██║  ██║██║ ╚████║ ║
║    ╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ║
║                                                               ║
║                    LETO - Learning Platform                   ║
║                  Telegram WebApp + Bot System                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;

console.log(asciiArt);
console.log('🌟 Добро пожаловать в Esperanto-Leto!');
console.log('📚 Платформа для изучения международного языка эсперанто');
console.log('');

// Проверка переменных окружения
function checkEnvironment() {
  console.log('🔍 Проверка конфигурации...');
  
  const requiredVars = [
    'TELEGRAM_BOT_TOKEN',
    'BOT_USERNAME',
    'WEBAPP_URL'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Отсутствуют обязательные переменные окружения:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n📝 Создайте файл .env в корне проекта с этими переменными');
    console.error('💡 Пример:');
    console.error('   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrSTUvwxyz');
    console.error('   BOT_USERNAME=YourBotUsername');
    console.error('   WEBAPP_URL=https://your-domain.com');
    process.exit(1);
  }
  
  console.log('✅ Конфигурация корректна');
}

// Показать информацию о системе
function showSystemInfo() {
  console.log('\n📋 ИНФОРМАЦИЯ О СИСТЕМЕ:');
  console.log('=' .repeat(40));
  console.log(`🤖 Telegram бот: @${process.env.BOT_USERNAME}`);
  console.log(`🌐 WebApp URL: ${process.env.WEBAPP_URL}`);
  console.log(`⚡ Node.js: ${process.version}`);
  console.log(`📅 Время запуска: ${new Date().toLocaleString('ru-RU')}`);
  console.log('');
}

// Показать доступные команды
function showCommands() {
  console.log('📖 ДОСТУПНЫЕ КОМАНДЫ:');
  console.log('=' .repeat(40));
  console.log('npm start              - Запуск всей платформы');
  console.log('npm run bot            - Только Telegram бот');
  console.log('npm run dev            - Только веб-приложение');
  console.log('npm run diagnostics    - Диагностика системы');
  console.log('npm run build          - Сборка для продакшена');
  console.log('');
}

// Главная функция
async function main() {
  try {
    // Проверяем окружение
    checkEnvironment();
    
    // Показываем информацию
    showSystemInfo();
    showCommands();
    
    // Создаем менеджер процессов
    const manager = new ProcessManager();
    
    // Обрабатываем аргументы командной строки
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
      showCommands();
      process.exit(0);
    }
    
    if (args.includes('--bot-only')) {
      console.log('🤖 Запуск только Telegram бота...');
      await manager.startTelegramBot();
    } else if (args.includes('--webapp-only')) {
      console.log('🌐 Запуск только веб-приложения...');
      await manager.startWebApp();
    } else {
      // Запускаем всю платформу
      console.log('🚀 Запуск полной платформы...');
      await manager.startAll();
    }
    
  } catch (error) {
    console.error('💥 Критическая ошибка запуска:', error);
    process.exit(1);
  }
}

// Запускаем главную функцию
main();