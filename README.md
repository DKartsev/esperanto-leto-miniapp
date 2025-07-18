# Esperanto-Leto Telegram WebApp с Universal Links и Supabase

Полнофункциональное веб-приложение для изучения эсперанто, интегрированное с Telegram Bot API, WebApp, Universal Links и базой данных Supabase.

## 🚀 Быстрый запуск

### 1. Установка зависимостей
```bash
npm install
```
> Выполняйте эту команду перед запуском любых `npm run` скриптов ниже.
> Отсутствующие пакеты вызовут ошибки ESLint.

### 2. Настройка переменных окружения
Создайте файл `.env` в корне проекта на основе `.env.example`:
```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
BOT_USERNAME=EsperantoLetoBot
WEBAPP_URL=https://tgminiapp.esperanto-leto.ru

# OpenAI (опционально)
VITE_OPENAI_API_KEY=your_openai_api_key

# Supabase (обязательно)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Настройка Supabase

#### 3.1. Создание проекта
1. Зайдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте URL проекта и Anon Key в `.env` файл

#### 3.2. Настройка базы данных
1. Откройте SQL Editor в Supabase Dashboard
2. Выполните SQL скрипт из файла `src/database/schema.sql`
3. Убедитесь, что все таблицы созданы успешно

#### 3.3. Настройка аутентификации
1. В Supabase Dashboard перейдите в Authentication > Settings
2. Включите Email authentication
3. Отключите Email confirmations (для упрощения)
4. Настройте Site URL: `https://tgminiapp.esperanto-leto.ru`

### 4. Запуск платформы

#### Полная платформа (рекомендуется)
```bash
npm start
```
Запускает одновременно:
- 🤖 Telegram бот на порту API
- 🌐 Веб-приложение на http://localhost:5173

#### Отдельные компоненты
```bash
# Только веб-приложение
npm run dev

# Только Telegram бот
npm run bot

# Бот с автоперезапуском (для разработки)
npm run bot:dev

# Диагностика системы
npm run diagnostics
```

### 🔐 Admin-доступ

- Почта: `admin5050@gmail.com`
- Пароль: `admin`
- Вход без подтверждения по email

## 🗄️ База данных и аутентификация

### Структура базы данных

#### Таблица `profiles`
- Профили пользователей с дополнительной информацией
- Связана с `auth.users` через внешний ключ
- Содержит username, email, Telegram данные

#### Таблица `user_progress`
- Прогресс пользователей по вопросам и разделам
- Отслеживает правильность ответов и время
- Связана с пользователем через `user_id`

#### Таблица `test_results`
- Результаты прохождения тестов
- Содержит общий балл и баллы по разделам
- JSON поле для гибкого хранения данных

#### Таблица `user_achievements`
- Достижения пользователей
- Гибкая структура через JSON поля

### Использование в коде

#### Аутентификация
```javascript
import { useAuth } from './src/components/SupabaseAuthProvider'

function MyComponent() {
  const { user, signIn, signUp, signOut, loading } = useAuth()
  
  // Проверка аутентификации
  if (!user) {
    return <LoginForm />
  }
  
  return <AuthenticatedContent />
}
```

#### Сохранение прогресса
```javascript
import { saveAnswer, getUserProgress } from './src/services/progressService.js'

// Сохранение ответа
await saveAnswer(chapterId, sectionId, questionId, isCorrect, selectedAnswer, timeSpent)

// Получение прогресса
const progress = await getUserProgress()
```

#### Работа с тестами
```javascript
import { saveTestResult, getUserTestResults } from './src/services/progressService.js'

// Сохранение результата теста
await saveTestResult({
  testType: 'general',
  score: 85,
  totalQuestions: 40,
  correctAnswers: 34,
  timeSpent: 1800,
  sectionScores: { reading: 90, writing: 80, listening: 85, grammar: 85 }
})
```

## 🔐 Безопасность

### Row Level Security (RLS)
- Все таблицы защищены RLS политиками
- Пользователи видят только свои данные
- Автоматическая фильтрация по `auth.uid()`

### Политики безопасности
- `profiles`: пользователи могут читать и обновлять только свой профиль
- `user_progress`: доступ только к собственному прогрессу
- `test_results`: доступ только к собственным результатам
- `user_achievements`: доступ только к собственным достижениям

## 📊 Аналитика и статистика

### Встроенные функции
- `get_user_stats(user_uuid)` - получение статистики пользователя
- `get_chapter_progress(user_uuid, chapter_num)` - прогресс по главе
- `user_stats_view` - представление для удобного получения статистики

### Метрики
- Общее количество ответов
- Процент правильных ответов
- Время, потраченное на обучение
- Количество завершенных глав и разделов
- Последняя активность

### 📈 Логика прогресса и достижений

- Все ответы сохраняются в таблицу `user_progress`
- Результаты прохождения разделов — в `test_results`
- Достижения сохраняются в `user_achievements`
- Логика "Что дальше" определяет следующий раздел или главу

Пример кода:

```ts
await saveProgress()
await saveTestResults()
await checkAndAssignAchievements()
router.push(`/section/${nextSectionId}`)
```

## 🔧 Управление процессами

### Автоматический запуск
Система автоматически:
- ✅ Запускает Telegram бота и веб-приложение одновременно
- ✅ Перезапускает бот при сбоях (до 3 попыток)
- ✅ Корректно завершает все процессы при Ctrl+C
- ✅ Показывает логи обоих сервисов с цветовой маркировкой

### Мониторинг
```bash
# Проверка статуса всех процессов
node start.js --status

# Запуск только бота
node start.js --bot-only

# Запуск только веб-приложения  
node start.js --webapp-only
```

## 🔗 Universal Links Setup

### 1. Файлы конфигурации

#### Apple App Site Association
Файл `public/.well-known/apple-app-site-association` настроен для:
- **Bundle ID**: `6N38VWS5BX.org.telegram.Telegram-iOS`
- **Поддерживаемые пути**: `/webapp/*`

#### Android App Links
Файл `public/.well-known/assetlinks.json` настроен для:
- **Package**: `org.telegram.messenger`
- **SHA256 Fingerprint**: Официальный сертификат Telegram

### 2. Настройка домена

Убедитесь, что ваш домен:
- ✅ Доступен по **HTTPS** (обязательно!)
- ✅ Файлы `.well-known` доступны без редиректов
- ✅ Возвращает правильный `Content-Type: application/json`

## 🛠 Настройка в BotFather

### 1. Основные настройки WebApp

```
/newapp
Выберите бота: @EsperantoLetoBot
Название: Esperanto-Leto
Описание: Изучение международного языка эсперанто
URL: https://tgminiapp.esperanto-leto.ru
```

### 2. Настройка домена

```
/setappdomain
Выберите бота: @EsperantoLetoBot
Домен: tgminiapp.esperanto-leto.ru
```

## 📱 Deep Linking

### Поддерживаемые параметры:

- `chapter` - Номер главы (1-14)
- `section` - Номер раздела (1-5)
- `mode` - Режим приложения (`practice`, `test`, `ai`)

### Примеры ссылок:

```
# Открыть конкретную главу
https://tgminiapp.esperanto-leto.ru?chapter=3

# Открыть конкретный раздел
https://tgminiapp.esperanto-leto.ru?chapter=2&section=1

# Открыть в режиме теста
https://tgminiapp.esperanto-leto.ru?mode=test
```

## 🚀 Деплой и настройка

### 1. Переменные окружения

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
BOT_USERNAME=EsperantoLetoBot

# WebApp URL (ОБЯЗАТЕЛЬНО HTTPS!)
WEBAPP_URL=https://tgminiapp.esperanto-leto.ru

# Supabase (ОБЯЗАТЕЛЬНО!)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (опционально)
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 2. Сборка и деплой

```bash
# Сборка приложения
npm run build

# Проверка файлов .well-known
ls -la dist/.well-known/

# Деплой на хостинг с поддержкой HTTPS
```

## 🔍 Отладка

### Общие проблемы:

1. **Supabase не подключается**
   - Проверьте правильность URL и ключей в `.env`
   - Убедитесь, что таблицы созданы в базе данных
   - Проверьте настройки RLS политик

2. **Аутентификация не работает**
   - Проверьте настройки Authentication в Supabase
   - Убедитесь, что Site URL настроен правильно
   - Проверьте, что Email confirmations отключены

3. **Прогресс не сохраняется**
   - Проверьте, что пользователь аутентифицирован
   - Убедитесь, что RLS политики настроены правильно
   - Проверьте логи в консоли браузера

### Полезные команды для отладки:

```bash
# Проверка статуса процессов
npm run diagnostics

# Просмотр логов в реальном времени
npm start

# Тест только бота
npm run bot

# Тест только веб-приложения
npm run dev
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте все переменные окружения
2. Убедитесь в работе HTTPS
3. Проверьте настройки Supabase
4. Проверьте настройки в BotFather
5. Протестируйте на реальных устройствах

---

**Важно**: Для полной функциональности требуется настройка Supabase и правильная конфигурация всех переменных окружения.

## 🎯 Особенности интеграции с Supabase

### Преимущества новой системы:
- ✅ **Надежное хранение данных**: Все данные пользователей в облачной БД
- ✅ **Аутентификация**: Встроенная система регистрации и входа
- ✅ **Безопасность**: Row Level Security защищает данные пользователей
- ✅ **Масштабируемость**: Готово к росту количества пользователей
- ✅ **Синхронизация**: Прогресс синхронизируется между устройствами
- ✅ **Аналитика**: Детальная статистика и отчеты

### Команды управления:
```bash
npm start           # Запуск всей платформы с Supabase
npm run bot         # Только бот
npm run dev         # Только веб-приложение
npm run diagnostics # Диагностика
```

Теперь вся платформа работает с надежной облачной базой данных! 🚀