import { useEffect, useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MainLayout from './layout/MainLayout'
import LearningPage from './pages/LearningPage'
import TestPage from './pages/TestPage'
import AccountPage from './pages/AccountPage'
import BottomNav from './components/BottomNavigation'
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
      <Suspense fallback={<p className="text-center text-gray-400">Контент загружается...</p>}>
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

  console.log(currentTab, tabs[currentTab])

  const changeTab = (tab: Tab) => {
    setCurrentTab(tab)
  }

  return (
    <MainLayout>
      <div className="relative overflow-hidden bg-gray-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tabs[currentTab] ?? <p className="text-center text-red-500 mt-10">Компонент не найден</p>}
          </motion.div>
        </AnimatePresence>
        <BottomNav currentTab={currentTab} setCurrentTab={changeTab} />
      </div>
    </MainLayout>
  )
}

export default App;
