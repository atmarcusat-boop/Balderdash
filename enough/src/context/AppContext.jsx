import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  clearAllData,
  loadCheckins,
  loadOnboarded,
  saveCheckins,
  saveOnboarded,
  seedRandomData,
} from '../lib/storage'
import { todayKey } from '../lib/date'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [onboarded, setOnboarded] = useState(loadOnboarded)
  const [checkins, setCheckins] = useState(loadCheckins)

  const completeOnboarding = useCallback(() => {
    saveOnboarded(true)
    setOnboarded(true)
  }, [])

  const recordAnswer = useCallback((itemId, value, day = todayKey()) => {
    setCheckins((prev) => {
      const next = {
        ...prev,
        [day]: { ...prev[day], [itemId]: value },
      }
      saveCheckins(next)
      return next
    })
  }, [])

  const clearTodayAnswers = useCallback((day = todayKey()) => {
    setCheckins((prev) => {
      const next = { ...prev }
      delete next[day]
      saveCheckins(next)
      return next
    })
  }, [])

  const resetAllData = useCallback(() => {
    clearAllData()
    setCheckins({})
    setOnboarded(false)
  }, [])

  const seedTestData = useCallback(() => {
    const next = seedRandomData(90)
    setCheckins(next)
  }, [])

  const value = useMemo(
    () => ({
      onboarded,
      completeOnboarding,
      checkins,
      recordAnswer,
      clearTodayAnswers,
      resetAllData,
      seedTestData,
    }),
    [onboarded, completeOnboarding, checkins, recordAnswer, clearTodayAnswers, resetAllData, seedTestData],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
