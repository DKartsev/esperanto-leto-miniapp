# Esperanto-Leto Telegram Mini App

Приложение для изучения международного языка **эсперанто** через Telegram Mini App. Оно включает адаптивное обучение, AI-чат и статистику прогресса. Основные технологии: React, Supabase и Telegraf.

---

## 🌐 Архитектура

| Компонент       | Описание                                        |
|-----------------|-------------------------------------------------|
| **Frontend**    | React + Vite (Render: Static Site)              |
| **Backend**     | Node.js + Telegraf (Render: Web Service)        |
| **База данных** | Supabase (PostgreSQL + RLS + Storage)           |
| **Авторизация** | Telegram WebApp login (используется Telegram ID) |

---

## 🚀 Быстрый запуск локально

1. **Клонируйте репозиторий**
   ```bash
   git clone https://github.com/DKartsev/esperanto-leto-miniapp.git
   cd esperanto-leto-miniapp
   ```
2. **Установите зависимости**
   ```bash
   npm install
   ```
3. **Создайте `.env` файл** (общий для фронтенда и бэкенда)
   ```env
   VITE_SUPABASE_URL=https://ynwmpmdyqnhsebhcuktn.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   WEBAPP_URL=https://esperanto-leto-miniapp.onrender.com
   TELEGRAM_BOT_TOKEN=your_bot_token
   BOT_USERNAME=EsperantoLetoBot
   ```
   Убедитесь, что переменные начинаются с `VITE_`, чтобы Vite мог их экспортировать в фронтенд.
4. **Запустите проект**
   ```bash
   npm run dev
   ```
   Откройте браузер: [http://localhost:5173](http://localhost:5173)

---

## ⚙️ Деплой на Render

### 🟩 Static Site (Frontend)
- **Service type:** Static Site
- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`
- Переменные окружения:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### 🟦 Web Service (Telegram Bot)
- **Service type:** Web Service (Node.js)
- **Start command:** `node src/bot/index.js` (или `npm run bot`)
- Переменные окружения:
  - `TELEGRAM_BOT_TOKEN`
  - `BOT_USERNAME`
  - `WEBAPP_URL`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

---

## 📦 База данных (Supabase)
- Основные таблицы: `chapters`, `sections`, `theory_blocks`, `questions`, `user_progress`, `user_chapter_progress`, `profiles`, `users`.
- Авторизация через Telegram ID: значение сохраняется как UUID в `users` и `profiles`.
- Политики RLS фильтруют данные по `user_id`.

## 📲 Telegram Mini App
- Бот: **@EsperantoLetoBot**
- URL Mini App: <https://esperanto-leto-miniapp.onrender.com>
- При входе через WebApp профиль пользователя создаётся автоматически.

## 🧪 Тестирование
```bash
npm run lint
npm test
```

## 🔒 Безопасность
- `.env` не коммитится в репозиторий.
- В `vite.config.ts` перечислены только нужные переменные окружения.
- Доступ к данным ограничен RLS политиками Supabase.

## 📌 Полезные команды
```bash
npm run dev        # Локальный сервер
npm run build      # Сборка продакшн-версии
npm run bot        # Запуск Telegram‑бота
```

## 👨‍💻 Поддержка
Если возникли вопросы, пишите разработчику в Telegram: [@DKartsev](https://t.me/DKartsev)
