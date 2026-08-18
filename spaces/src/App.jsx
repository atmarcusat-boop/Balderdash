import { useGame } from './context/GameContext'
import Onboarding from './components/Onboarding'
import GameScreen from './components/GameScreen'

function App() {
  const { onboarded } = useGame()

  if (!onboarded) {
    return <Onboarding />
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        <GameScreen />
      </main>
    </div>
  )
}

export default App
