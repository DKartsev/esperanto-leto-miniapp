import { Home, FileText, Bot, User } from 'lucide-react';
import { Routes, Route } from 'react-router-dom';
import type { NavigationItem } from './components/NavigationBar';
import MainLayout from './layout/MainLayout';
import LearningPage from './pages/LearningPage';
import TestPage from './pages/TestPage';
import AIChatPage from './pages/AIChatPage';
import AccountPage from './pages/AccountPage';
import LandingPage from './pages/LandingPage';

const navItems: NavigationItem[] = [
  { id: 'home', label: 'Главная', icon: Home, path: '/' },
  { id: 'test', label: 'Тест', icon: FileText, path: '/test' },
  { id: 'ai', label: 'AI', icon: Bot, path: '/ai' },
  { id: 'account', label: 'Мой аккаунт', icon: User, path: '/account' },
];

function App() {
  return (
    <MainLayout items={navItems}>
      <Routes>
        <Route path="/" element={<LearningPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/ai" element={<AIChatPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
