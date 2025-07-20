import { FC } from 'react';
import { Wallet } from 'lucide-react';

interface FooterProps {
  isTelegramWebApp: boolean;
  isAdmin?: boolean;
}

const Footer: FC<FooterProps> = ({ isTelegramWebApp, isAdmin }) => (
  <footer className="bg-emerald-900 text-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Esperanto-Leto</h3>
              <p className="text-sm text-emerald-300">
                {isTelegramWebApp ? 'Telegram WebApp' : 'Мини-приложение'}
              </p>
            </div>
          </div>
          <p className="text-emerald-200 mb-6 max-w-md">
            {isTelegramWebApp
              ? 'Изучайте международный язык эсперанто с помощью современных технологий и AI-помощника прямо в Telegram.'
              : 'Безопасный и удобный способ управления криптовалютами прямо в Telegram. Торгуйте, переводите и храните средства с максимальной защитой.'}
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-emerald-100">
            {isTelegramWebApp ? 'Обучение' : 'Продукт'}
          </h4>
          <ul className="space-y-2 text-emerald-300">
            <li><span className="cursor-default hover:text-white transition-colors">{isTelegramWebApp ? 'Главы курса' : 'Кошелек'}</span></li>
            <li><span className="cursor-default hover:text-white transition-colors">{isTelegramWebApp ? 'AI-помощник' : 'Биржа'}</span></li>
            <li><span className="cursor-default hover:text-white transition-colors">{isTelegramWebApp ? 'Тесты' : 'P2P'}</span></li>
            <li><span className="cursor-default hover:text-white transition-colors">{isTelegramWebApp ? 'Прогресс' : 'API'}</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-emerald-100">Поддержка</h4>
          <ul className="space-y-2 text-emerald-300">
            <li><span className="cursor-default hover:text-white transition-colors">Помощь</span></li>
            <li><span className="cursor-default hover:text-white transition-colors">{isTelegramWebApp ? 'Обратная связь' : 'Безопасность'}</span></li>
            <li><span className="cursor-default hover:text-white transition-colors">Условия</span></li>
            <li><span className="cursor-default hover:text-white transition-colors">Контакты</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-emerald-800 mt-12 pt-8 text-center text-emerald-300">
        <p>&copy; 2024 Esperanto-Leto. Все права защищены.</p>
        {isTelegramWebApp && <p className="mt-2 text-sm">Работает в Telegram WebApp</p>}
        {isAdmin && (
          <p className="mt-2 text-sm bg-emerald-800 inline-block px-3 py-1 rounded-full">👑 Режим администратора активен</p>
        )}
      </div>
    </div>
  </footer>
);

export default Footer;
