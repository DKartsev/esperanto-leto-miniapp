import { FC } from 'react';
import { Wallet, MessageCircle } from 'lucide-react';

interface HeaderProps {
  isTelegramWebApp: boolean;
  isAdmin?: boolean;
}

const Header: FC<HeaderProps> = ({ isTelegramWebApp, isAdmin }) => (
  <header className="bg-white/90 backdrop-blur-md border-b border-emerald-200 sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-emerald-900">Esperanto-Leto</h1>
            <p className="text-xs text-emerald-600">
              {isTelegramWebApp ? 'Telegram WebApp' : 'Мини-приложение'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          <MessageCircle className="w-4 h-4" />
          <span>{isTelegramWebApp ? 'WEBAPP' : 'TELEGRAM'}</span>
          {isAdmin && (
            <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">👑 ADMIN</span>
          )}
        </div>
      </div>
    </div>
  </header>
);

export default Header;
