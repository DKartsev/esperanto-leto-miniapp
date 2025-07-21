// Диагностический скрипт для проверки Telegram бота
import 'dotenv/config';

console.log('🔍 ДИАГНОСТИКА TELEGRAM БОТА');
console.log('=' .repeat(50));

// 1. Проверка переменных окружения
console.log('\n1. ПРОВЕРКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ:');
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 
  `✅ Установлен (${process.env.TELEGRAM_BOT_TOKEN.substring(0, 10)}...)` : 
  '❌ НЕ УСТАНОВЛЕН');
console.log('BOT_USERNAME:', process.env.BOT_USERNAME || '⚠️ Не установлен');
console.log('WEBAPP_URL:', process.env.WEBAPP_URL || '⚠️ Не установлен');

// 2. Проверка формата токена
console.log('\n2. ПРОВЕРКА ФОРМАТА ТОКЕНА:');
const token = process.env.TELEGRAM_BOT_TOKEN;
if (token) {
  const tokenPattern = /^\d+:[A-Za-z0-9_-]{35}$/;
  if (tokenPattern.test(token)) {
    console.log('✅ Формат токена корректный');
  } else {
    console.log('❌ Формат токена некорректный');
    console.log('Ожидаемый формат: 123456789:ABCdefGHIjklMNOpqrSTUvwxyz-1234567890');
  }
} else {
  console.log('❌ Токен отсутствует');
}

// 3. Тест подключения к Telegram API
console.log('\n3. ТЕСТ ПОДКЛЮЧЕНИЯ К TELEGRAM API:');
if (token) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Подключение к API успешно');
      console.log('📋 Информация о боте:');
      console.log(`   ID: ${data.result.id}`);
      console.log(`   Username: @${data.result.username}`);
      console.log(`   First Name: ${data.result.first_name}`);
      console.log(`   Can Join Groups: ${data.result.can_join_groups}`);
      console.log(`   Can Read All Group Messages: ${data.result.can_read_all_group_messages}`);
      console.log(`   Supports Inline Queries: ${data.result.supports_inline_queries}`);
    } else {
      console.log('❌ Ошибка API:', data.description);
    }
  } catch (error) {
    console.log('❌ Ошибка сети:', error.message);
  }
} else {
  console.log('❌ Невозможно протестировать - токен отсутствует');
}

// 4. Проверка webhook статуса
console.log('\n4. ПРОВЕРКА WEBHOOK:');
if (token) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await response.json();
    
    if (data.ok) {
      if (data.result.url) {
        console.log('⚠️ Webhook установлен:', data.result.url);
        console.log('   Для polling нужно удалить webhook');
      } else {
        console.log('✅ Webhook не установлен (подходит для polling)');
      }
    }
  } catch (error) {
    console.log('❌ Ошибка проверки webhook:', error.message);
  }
}

// 5. Рекомендации
console.log('\n5. РЕКОМЕНДАЦИИ:');
console.log('📝 Для исправления проблем:');
console.log('   1. Убедитесь, что токен бота корректный');
console.log('   2. Проверьте, что бот не заблокирован в @BotFather');
console.log('   3. Удалите webhook если он установлен');
console.log('   4. Перезапустите бота после исправлений');

console.log('\n' + '=' .repeat(50));
console.log('🏁 ДИАГНОСТИКА ЗАВЕРШЕНА');
