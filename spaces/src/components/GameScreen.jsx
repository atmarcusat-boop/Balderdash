import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ListRestart, Play, Settings as SettingsIcon, X } from 'lucide-react'
import { useGame } from '../context/GameContext'
import WordCard from './WordCard'
import Settings from './Settings'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function GameScreen() {
  const { phase, currentWord, loadingWord, correctCount, wordsToWin, timeLeft, startGame, skipWord, handleCorrect, playAgain } =
    useGame()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const cardRef = useRef(null)

  if (phase === 'ready') {
    return (
      <div className="game-screen game-screen-center">
        <button
          type="button"
          className="settings-gear tap-target"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          <SettingsIcon size={18} strokeWidth={2.25} />
        </button>
        <p className="reflection-eyebrow">Spaces</p>
        <h1 className="reflection-text">Fill the gaps.</h1>
        <p className="reflection-sub">Get 10 right before the clock runs out. Each one buys 30 more seconds.</p>
        <button type="button" className="btn btn-primary btn-icon tap-target" onClick={startGame}>
          <Play size={16} strokeWidth={2.25} />
          Start
        </button>
        <AnimatePresence>{settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}</AnimatePresence>
      </div>
    )
  }

  if (phase === 'won') {
    return (
      <div className="game-screen game-screen-center">
        <p className="reflection-eyebrow">Spaces</p>
        <h1 className="reflection-text">10 for 10.</h1>
        <p className="reflection-sub">You cleared the board with {formatTime(timeLeft)} left on the clock.</p>
        <button type="button" className="btn btn-primary btn-icon tap-target" onClick={playAgain}>
          <ListRestart size={16} strokeWidth={2.25} />
          Play again
        </button>
      </div>
    )
  }

  if (phase === 'lost') {
    return (
      <div className="game-screen game-screen-center">
        <p className="reflection-eyebrow">Spaces</p>
        <h1 className="reflection-text">Time's up.</h1>
        <p className="reflection-sub">
          {correctCount} of {wordsToWin} — close it out next time.
        </p>
        <button type="button" className="btn btn-primary btn-icon tap-target" onClick={playAgain}>
          <ListRestart size={16} strokeWidth={2.25} />
          Try again
        </button>
      </div>
    )
  }

  const timerLow = timeLeft <= 30

  return (
    <div className="game-screen">
      <div className="game-top">
        <div className={`game-timer${timerLow ? ' game-timer-low' : ''}`}>{formatTime(timeLeft)}</div>
        <button
          type="button"
          className="settings-gear tap-target"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          <SettingsIcon size={18} strokeWidth={2.25} />
        </button>
      </div>

      <div className="game-progress-track">
        <motion.div
          className="game-progress-fill"
          animate={{ width: `${(correctCount / wordsToWin) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <p className="game-progress-label">
        {correctCount} of {wordsToWin}
      </p>

      <div className="game-stack">
        {currentWord && !loadingWord ? (
          <WordCard
            key={currentWord.word}
            ref={cardRef}
            item={currentWord}
            onSkip={skipWord}
            onCorrect={handleCorrect}
          />
        ) : (
          <div className="word-card word-card-loading">
            <span className="word-card-loading-text">Finding a word&hellip;</span>
          </div>
        )}
      </div>

      <div className="game-buttons">
        <button
          type="button"
          className="game-btn game-btn-skip tap-target"
          aria-label="Skip"
          disabled={!currentWord || loadingWord}
          onClick={() => cardRef.current?.skip()}
        >
          <X size={22} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          className="game-btn game-btn-check tap-target"
          aria-label="Check answer"
          disabled={!currentWord || loadingWord}
          onClick={() => cardRef.current?.submit()}
        >
          <Check size={22} strokeWidth={2.5} />
        </button>
      </div>

      <AnimatePresence>{settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}</AnimatePresence>
    </div>
  )
}
