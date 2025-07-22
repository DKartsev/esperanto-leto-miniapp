import { Home, FileText, Bot, User } from 'lucide-react'
import { Routes, Route } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import type { NavigationItem } from './components/NavigationBar'
import MainLayout from './layout/MainLayout'
import LearningPage from './pages/LearningPage'
import TestPage from './pages/TestPage'
import AccountPage from './pages/AccountPage'
const AIChatPage = lazy(() => import('./pages/AIChatPage'))
const LandingPage = lazy(() => import('./pages/LandingPage'))
import StartupLoader from './components/StartupLoader'

const navItems: NavigationItem[] = [
  { id: 'home', label: 'Главная', icon: Home, path: '/' },
  { id: 'test', label: 'Тест', icon: FileText, path: '/test' },
  { id: 'ai', label: 'AI', icon: Bot, path: '/ai' },
  { id: 'account', label: 'Мой аккаунт', icon: User, path: '/account' },
];

function App() {
  const [loadingFinished, setLoadingFinished] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('intro_seen') === '1') {
      setLoadingFinished(true)
    }
  }, [])


  const handleIntroFinish = () => {
    localStorage.setItem('intro_seen', '1')
    setLoadingFinished(true)
  }

  if (!loadingFinished) {
    return <StartupLoader onFinish={handleIntroFinish} />
  }

  return (
    <MainLayout items={navItems}>
      <Routes>
        <Route path="/" element={<LearningPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route
          path="/ai"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <AIChatPage />
            </Suspense>
          }
        />
        <Route path="/account" element={<AccountPage />} />
        <Route
          path="/landing"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <LandingPage />
            </Suspense>
          }
        />
      </Routes>
    </MainLayout>
  )
}

export default App;
