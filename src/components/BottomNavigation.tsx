import { Home, FileText, Bot, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';

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
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-2 z-50">
      {navItems.map(({ label, icon: Icon, path, animation }) => (
        <NavLink
          key={path}
          to={path}
          end
          className={({ isActive }) =>
            clsx(
              'flex-1 flex flex-col items-center justify-center text-xs transition-colors duration-300 ease-in-out',
              isActive
                ? 'text-green-600 font-semibold'
                : 'text-gray-500 hover:text-green-600'
            )
          }
        >
          <motion.div whileTap={animation} transition={{ duration: 0.2 }} className="flex flex-col items-center justify-center">
            <Icon className="w-5 h-5 mb-1" />
            <span>{label}</span>
          </motion.div>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavigation;
