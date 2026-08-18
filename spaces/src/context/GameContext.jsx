import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { buildBlanks } from '../lib/blanks'
import { loadApiKey, loadOnboarded, saveApiKey, saveOnboarded } from '../lib/settingsStorage'
import { nextWord } from '../lib/wordSource'

const START_SECONDS = 5 * 60
const BONUS_SECONDS = 15
const WORDS_TO_WIN = 10

// Base points for any correct answer, plus a difficulty bonus (up to
// +150 for the hardest words) and a speed bonus (up to +80 for answering
// inside a couple of seconds, tapering to 0 past 20 seconds).
function calcPoints(difficulty, elapsedSeconds) {
  const base = 50
  const difficultyBonus = Math.round(difficulty * 150)
  const speedBonus = Math.max(0, Math.round((20 - elapsedSeconds) * 4))
  return base + difficultyBonus + speedBonus
}

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [onboarded, setOnboarded] = useState(loadOnboarded)
  const [apiKey, setApiKeyState] = useState(loadApiKey)
  const [phase, setPhase] = useState('ready') // ready | playing | won | lost
  const [currentWord, setCurrentWord] = useState(null)
  const [loadingWord, setLoadingWord] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(START_SECONDS)
  const [score, setScore] = useState(0)
  const [lastPoints, setLastPoints] = useState(null) // { value, id } — triggers the coin popup
  const usedWordsRef = useRef([])
  const requestIdRef = useRef(0)
  const wordStartedAtRef = useRef(null)
  const pointsIdRef = useRef(0)

  const setApiKey = useCallback((key) => {
    saveApiKey(key)
    setApiKeyState(key)
  }, [])

  const completeOnboarding = useCallback(() => {
    saveOnboarded(true)
    setOnboarded(true)
  }, [])

  const loadNextWord = useCallback(
    async (round) => {
      const requestId = ++requestIdRef.current
      setLoadingWord(true)
      const difficulty = round / (WORDS_TO_WIN - 1)
      const entry = await nextWord(apiKey, usedWordsRef.current, difficulty)
      if (requestId !== requestIdRef.current) return // a newer request superseded this one
      usedWordsRef.current = [...usedWordsRef.current, entry.word]
      setCurrentWord({ ...entry, difficulty, blanks: buildBlanks(entry.word, difficulty) })
      setLoadingWord(false)
      wordStartedAtRef.current = Date.now()
    },
    [apiKey],
  )

  const startGame = useCallback(() => {
    usedWordsRef.current = []
    setCorrectCount(0)
    setScore(0)
    setLastPoints(null)
    setTimeLeft(START_SECONDS)
    setCurrentWord(null)
    setPhase('playing')
    loadNextWord(0)
  }, [loadNextWord])

  const skipWord = useCallback(() => {
    loadNextWord(correctCount)
  }, [loadNextWord, correctCount])

  const handleCorrect = useCallback(() => {
    const elapsed = wordStartedAtRef.current ? (Date.now() - wordStartedAtRef.current) / 1000 : 20
    const points = calcPoints(currentWord?.difficulty || 0, elapsed)
    setScore((s) => s + points)
    setLastPoints({ value: points, id: ++pointsIdRef.current })

    setTimeLeft((t) => t + BONUS_SECONDS)
    const next = correctCount + 1
    setCorrectCount(next)
    if (next >= WORDS_TO_WIN) {
      setPhase('won')
    } else {
      loadNextWord(next)
    }
  }, [correctCount, loadNextWord, currentWord])

  const playAgain = useCallback(() => {
    setPhase('ready')
  }, [])

  // Countdown only runs once a word is actually on screen, so network
  // latency for the first word never eats into the player's time.
  useEffect(() => {
    if (phase !== 'playing' || !currentWord || loadingWord) return undefined
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval)
          setPhase('lost')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, currentWord, loadingWord])

  const value = {
    onboarded,
    completeOnboarding,
    apiKey,
    setApiKey,
    phase,
    currentWord,
    loadingWord,
    correctCount,
    wordsToWin: WORDS_TO_WIN,
    timeLeft,
    score,
    lastPoints,
    startGame,
    skipWord,
    handleCorrect,
    playAgain,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
