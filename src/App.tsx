import { useEffect, useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [currentTab, setCurrentTab] = useState<Tab>('home')

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
    profile: (
      <AccountPage
        onNavigateHome={() => setCurrentTab('home')}
        onStartChapter={(id: number) => {
          console.log('Start chapter', id)
          setCurrentTab('home')
        }}
      />
    ),
  }

  console.log('Текущий экран:', currentTab)
  console.log('Компонент:', tabs[currentTab])

  const changeTab = (tab: Tab) => {
    setCurrentTab(tab)
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
            {tabs[currentTab] ?? <p>Компонент не найден</p>}
          </motion.div>
        </AnimatePresence>
        <BottomNavigation currentTab={currentTab} setCurrentTab={changeTab} />
      </div>
    </MainLayout>
  )
}

export default App;
