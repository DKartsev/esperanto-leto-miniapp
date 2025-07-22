import { FC, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import NavigationBar, { NavigationItem } from '../components/NavigationBar';
import LogConsole from '../components/ui/LogConsole';

interface MainLayoutProps {
  children: ReactNode;
  items: NavigationItem[];
  showNavigation?: boolean;
}

const MainLayout: FC<MainLayoutProps> = ({ children, items, showNavigation = true }) => {
  const navigate = useNavigate();
  const handlers = useSwipeable({
    onSwipedRight: (data) => {
      if (data.initial[0] <= 30 && data.deltaX > 50) {
        navigate(-1);
      }
    },
    trackTouch: true,
  });

  return (
    <div
      {...handlers}
      className={`min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 ${showNavigation ? 'pb-24' : ''}`}
    >
      {children}
      <LogConsole />
      <NavigationBar items={items} show={showNavigation} />
    </div>
  );
};

export default MainLayout;
