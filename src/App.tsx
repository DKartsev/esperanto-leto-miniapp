import { useEffect, useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import MainLayout from './layout/MainLayout'
import LearningPage from './pages/LearningPage'
import TestPage from './pages/TestPage'
import AccountPage from './pages/AccountPage'
import BottomNavigation from './components/BottomNavigation'
const AIChatPage = lazy(() => import('./pages/AIChatPage'))
import StartupLoader from './components/StartupLoader'


type Tab = 'home' | 'test' | 'ai' | 'profile'

function App() {
  const [loadingFinished, setLoadingFinished] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [currentTab, setCurrentTab] = useState<Tab>('home')

  const tabPaths: Record<Tab, string> = {
    home: '/',
    test: '/test',
    ai: '/ai',
    profile: '/account'
  }

  useEffect(() => {
    const path = location.pathname
    if (path.startsWith('/test')) setCurrentTab('test')
    else if (path.startsWith('/ai')) setCurrentTab('ai')
    else if (path.startsWith('/account')) setCurrentTab('profile')
    else setCurrentTab('home')
  }, [location.pathname])

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

  const tabs: Record<Tab, JSX.Element> = {
    home: <LearningPage />,
    test: <TestPage />,
    ai: (
      <Suspense fallback={<div>Loading...</div>}>
        <AIChatPage />
      </Suspense>
    ),
    profile: <AccountPage />,
  }

  const changeTab = (tab: Tab) => {
    setCurrentTab(tab)
    navigate(tabPaths[tab], { replace: true })
  }

  return (
    <MainLayout>
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {tabs[currentTab]}
          </motion.div>
        </AnimatePresence>
        <BottomNavigation currentTab={currentTab} setCurrentTab={changeTab} />
      </div>
    </MainLayout>
  )
}

export default App;
