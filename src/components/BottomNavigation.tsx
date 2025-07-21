import { Home, FileText, Bot, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { BOTTOM_NAV_ITEM_BASE } from '../utils/classNames';

const navItems = [
  { label: 'Главная', icon: Home, path: '/', animation: { scale: 1.2 } },
  { label: 'Тест', icon: FileText, path: '/test', animation: { y: -8 } },
  { label: 'AI', icon: Bot, path: '/ai', animation: { rotate: 20 } },
  {
    label: 'Аккаунт',
    icon: User,
    path: '/account',
    animation: { boxShadow: '0 0 8px rgb(34 197 94)', backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: '0.375rem' },
  },
];

const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-md flex justify-around items-center py-2 z-50">
      {navItems.map(({ label, icon: Icon, path, animation }) => (
        <NavLink key={path} to={path} end className={BOTTOM_NAV_ITEM_BASE}>
          {({ isActive }) => (
            <motion.div
              whileTap={animation}
              transition={{ duration: 0.2 }}
              className={clsx(
                'flex flex-col items-center',
                isActive ? 'text-green-600 font-semibold' : 'text-gray-400 hover:text-green-600'
              )}
            >
              <div
                className={clsx(
                  'p-2 rounded-full transition-all',
                  isActive
                    ? 'ring-2 ring-green-500 text-green-600'
                    : 'text-gray-400 group-hover:text-green-600'
                )}
              >
                <Icon size={20} />
              </div>
              <span
                className={clsx(
                  'mt-1 transition-colors',
                  isActive ? 'font-semibold text-green-600' : 'text-gray-400 group-hover:text-green-600'
                )}
              >
                {label}
              </span>
            </motion.div>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavigation;
