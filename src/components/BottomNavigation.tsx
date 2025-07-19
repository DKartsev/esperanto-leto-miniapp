import { Home, FileText, Bot, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const navItems = [
  { label: 'Главная', icon: Home, path: '/' },
  { label: 'Тест', icon: FileText, path: '/test' },
  { label: 'AI', icon: Bot, path: '/ai' },
  { label: 'Аккаунт', icon: User, path: '/account' },
];

const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-2 z-50">
      {navItems.map(({ label, icon: Icon, path }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center justify-center text-xs transition duration-300 ease-in-out',
              isActive
                ? 'text-green-600 font-semibold'
                : 'text-gray-500 hover:text-green-600'
            )
          }
        >
          <Icon className="w-5 h-5 mb-1" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavigation;
