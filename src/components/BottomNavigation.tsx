import { Home, FileText, Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { BOTTOM_NAV_ITEM_BASE } from '../utils/classNames';

export type Tab = 'home' | 'test' | 'ai' | 'profile';

interface BottomNavigationProps {
  currentTab: Tab;
  setCurrentTab: (tab: Tab) => void;
}

const navItems: { label: string; icon: typeof Home; tab: Tab; animation: any }[] = [
  { label: 'Главная', icon: Home, tab: 'home', animation: { scale: 1.2 } },
  { label: 'Тест', icon: FileText, tab: 'test', animation: { y: -8 } },
  { label: 'AI', icon: Bot, tab: 'ai', animation: { rotate: 20 } },
  {
    label: 'Аккаунт',
    icon: User,
    tab: 'profile',
    animation: {
      boxShadow: '0 0 8px rgb(34 197 94)',
      backgroundColor: 'rgba(34,197,94,0.2)',
      borderRadius: '0.375rem',
    },
  },
];

const BottomNav = ({ currentTab, setCurrentTab }: BottomNavigationProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-md flex justify-around items-center py-2 z-50">
      {navItems.map(({ label, icon: Icon, tab, animation }) => (
        <button
          key={tab}
          onClick={() => setCurrentTab(tab)}
          className={BOTTOM_NAV_ITEM_BASE}
        >
          <motion.div
            whileTap={animation}
            transition={{ duration: 0.2 }}
            className={clsx(
              'flex flex-col items-center',
              currentTab === tab ? 'text-green-600 font-semibold' : 'text-gray-400'
            )}
          >
            <div
              className={clsx(
                'p-2 rounded-full transition-all',
                currentTab === tab
                  ? 'ring-2 ring-green-500 text-green-600'
                  : 'text-gray-400'
              )}
            >
              <Icon size={20} />
            </div>
            <span
              className={clsx(
                'mt-1 transition-colors',
                currentTab === tab ? 'font-semibold text-green-600' : 'text-gray-400'
              )}
            >
              {label}
            </span>
          </motion.div>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
