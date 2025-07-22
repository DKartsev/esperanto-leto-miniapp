import { Home, FileText, Bot, User } from 'lucide-react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const location = useLocation()

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
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <LearningPage />
              </motion.div>
            }
          />
          <Route
            path="/test"
            element={
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <TestPage />
              </motion.div>
            }
          />
          <Route
            path="/ai"
            element={
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<div>Loading...</div>}>
                  <AIChatPage />
                </Suspense>
              </motion.div>
            }
          />
          <Route
            path="/account"
            element={
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <AccountPage />
              </motion.div>
            }
          />
          <Route
            path="/landing"
            element={
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<div>Loading...</div>}>
                  <LandingPage />
                </Suspense>
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
    </MainLayout>
  )
}

export default App;
