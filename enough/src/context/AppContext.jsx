import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import {
  clearAllData,
  loadCheckins,
  loadOnboarded,
  saveCheckins,
  saveOnboarded,
  seedRandomData,
} from '../lib/storage'
import { todayKey } from '../lib/date'
import { auth, firebaseEnabled, googleProvider } from '../lib/firebase'
import {
  fetchRemoteCheckins,
  mergeCheckins,
  subscribeRemoteCheckins,
  writeRemoteCheckins,
} from '../lib/cloudSync'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [onboarded, setOnboarded] = useState(loadOnboarded)
  const [checkins, setCheckins] = useState(loadCheckins)
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(!firebaseEnabled)
  const [authError, setAuthError] = useState(null)
  const [syncing, setSyncing] = useState(false)

  const checkinsRef = useRef(checkins)
  useEffect(() => {
    checkinsRef.current = checkins
  }, [checkins])

  // Track the signed-in Firebase user, if any.
  useEffect(() => {
    if (!firebaseEnabled) return undefined
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setAuthReady(true)
    })
    return unsubscribe
  }, [])

  // On sign-in: merge whatever's on this device with whatever's already in
  // the cloud (item-level, not day-level — nothing gets clobbered), push
  // the merged result back up, then stay subscribed so other devices'
  // changes flow in live.
  useEffect(() => {
    if (!user) return undefined
    let cancelled = false
    let unsubscribeSnapshot = () => {}

    setSyncing(true)
    ;(async () => {
      try {
        const remote = await fetchRemoteCheckins(user.uid)
        if (cancelled) return
        const merged = mergeCheckins(remote, checkinsRef.current)
        saveCheckins(merged)
        setCheckins(merged)
        await writeRemoteCheckins(user.uid, merged)
        if (cancelled) return
        unsubscribeSnapshot = subscribeRemoteCheckins(user.uid, (remoteCheckins) => {
          saveCheckins(remoteCheckins)
          setCheckins(remoteCheckins)
        })
      } finally {
        if (!cancelled) setSyncing(false)
      }
    })()

    return () => {
      cancelled = true
      unsubscribeSnapshot()
    }
  }, [user])

  const completeOnboarding = useCallback(() => {
    saveOnboarded(true)
    setOnboarded(true)
  }, [])

  const recordAnswer = useCallback(
    (itemId, value, day = todayKey()) => {
      setCheckins((prev) => {
        const next = {
          ...prev,
          [day]: { ...prev[day], [itemId]: value },
        }
        saveCheckins(next)
        if (user) writeRemoteCheckins(user.uid, next)
        return next
      })
    },
    [user],
  )

  const clearTodayAnswers = useCallback(
    (day = todayKey()) => {
      setCheckins((prev) => {
        const next = { ...prev }
        delete next[day]
        saveCheckins(next)
        if (user) writeRemoteCheckins(user.uid, next)
        return next
      })
    },
    [user],
  )

  const resetAllData = useCallback(() => {
    clearAllData()
    setCheckins({})
    setOnboarded(false)
    if (user) writeRemoteCheckins(user.uid, {})
  }, [user])

  const seedTestData = useCallback(() => {
    const next = seedRandomData(90)
    setCheckins(next)
    if (user) writeRemoteCheckins(user.uid, next)
  }, [user])

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      setAuthError(err?.message || 'Sign-in failed.')
    }
  }, [])

  const signOutUser = useCallback(async () => {
    await signOut(auth)
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
      accountsEnabled: firebaseEnabled,
      user,
      authReady,
      authError,
      syncing,
      signInWithGoogle,
      signOutUser,
    }),
    [
      onboarded,
      completeOnboarding,
      checkins,
      recordAnswer,
      clearTodayAnswers,
      resetAllData,
      seedTestData,
      user,
      authReady,
      authError,
      syncing,
      signInWithGoogle,
      signOutUser,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
