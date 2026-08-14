import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useApp } from './context/AppContext'
import Onboarding from './components/Onboarding'
import TodayDeck from './components/TodayDeck'
import Progress from './components/Progress'
import BottomNav from './components/BottomNav'
import Settings from './components/Settings'

function App() {
  const { onboarded } = useApp()
  const [screen, setScreen] = useState('today')
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (!onboarded) {
    return <Onboarding />
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        {screen === 'today' ? <TodayDeck /> : <Progress />}
      </main>

      <BottomNav screen={screen} onChange={setScreen} onOpenSettings={() => setSettingsOpen(true)} />

      <AnimatePresence>
        {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}

export default App
