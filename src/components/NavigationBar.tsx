import { FC } from 'react';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { NAV_ITEM_BASE, NAV_ICON_BASE } from '../utils/classNames';

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

interface NavigationBarProps {
  items: NavigationItem[];
  show?: boolean;
}

const NavigationBar: FC<NavigationBarProps> = ({ items, show = true }) => {
  const pathname = window.location.pathname;
  if (!show) return <p className="text-center text-gray-400">Контент загружается...</p>;
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-200 shadow-lg z-50 safe-area-inset-bottom">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center h-20 px-4 py-2">
          {items.map(({ id, label, icon: Icon, path }) => {
            const active = pathname === path;
            return (
              <a
                key={id}
                href={path}
                className={clsx(
                  NAV_ITEM_BASE,
                  active
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400 animate-gradient scale-105'
                    : 'text-gray-500 hover:text-emerald-500 active:scale-95'
                )}
              >
              <Icon className={clsx(NAV_ICON_BASE, 'text-gray-500')} />
              <span className="text-xs font-medium transition-all duration-200 text-center leading-tight">
                {label}
              </span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
