import { FC, ReactNode } from 'react';
import NavigationBar, { NavigationItem } from '../components/NavigationBar';
import LogConsole from '../components/ui/LogConsole';

interface MainLayoutProps {
  children: ReactNode;
  items: NavigationItem[];
  showNavigation?: boolean;
}

const MainLayout: FC<MainLayoutProps> = ({ children, items, showNavigation = true }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 ${showNavigation ? 'pb-24' : ''}`}>
      {children}
      <LogConsole />
      <NavigationBar items={items} show={showNavigation} />
    </div>
  );
};

export default MainLayout;
