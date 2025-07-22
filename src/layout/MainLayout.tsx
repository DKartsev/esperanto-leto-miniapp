import { FC, ReactNode } from 'react';
import LogConsole from '../components/ui/LogConsole';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 pb-24">
      {children}
      <LogConsole />
    </div>
  );
};

export default MainLayout;
