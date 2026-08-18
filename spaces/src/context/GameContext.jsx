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
const BONUS_SECONDS = 30
const WORDS_TO_WIN = 10

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [onboarded, setOnboarded] = useState(loadOnboarded)
  const [apiKey, setApiKeyState] = useState(loadApiKey)
  const [phase, setPhase] = useState('ready') // ready | playing | won | lost
  const [currentWord, setCurrentWord] = useState(null)
  const [loadingWord, setLoadingWord] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(START_SECONDS)
  const usedWordsRef = useRef([])
  const requestIdRef = useRef(0)

  const setApiKey = useCallback((key) => {
    saveApiKey(key)
    setApiKeyState(key)
  }, [])

  const completeOnboarding = useCallback(() => {
    saveOnboarded(true)
    setOnboarded(true)
  }, [])

  const loadNextWord = useCallback(async () => {
    const requestId = ++requestIdRef.current
    setLoadingWord(true)
    const entry = await nextWord(apiKey, usedWordsRef.current)
    if (requestId !== requestIdRef.current) return // a newer request superseded this one
    usedWordsRef.current = [...usedWordsRef.current, entry.word]
    setCurrentWord({ ...entry, blanks: buildBlanks(entry.word) })
    setLoadingWord(false)
  }, [apiKey])

  const startGame = useCallback(() => {
    usedWordsRef.current = []
    setCorrectCount(0)
    setTimeLeft(START_SECONDS)
    setCurrentWord(null)
    setPhase('playing')
    loadNextWord()
  }, [loadNextWord])

  const skipWord = useCallback(() => {
    loadNextWord()
  }, [loadNextWord])

  const handleCorrect = useCallback(() => {
    setTimeLeft((t) => t + BONUS_SECONDS)
    const next = correctCount + 1
    setCorrectCount(next)
    if (next >= WORDS_TO_WIN) {
      setPhase('won')
    } else {
      loadNextWord()
    }
  }, [correctCount, loadNextWord])

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
