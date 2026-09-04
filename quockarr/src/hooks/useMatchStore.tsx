import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { BallEvent, Innings, Match, MatchSettings, Player } from '../engine/types'
import { createMatch } from '../engine/matchEngine'

const STORAGE_KEY = 'quockarr.match.v1'

function readStoredMatch(): Match | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Match
  } catch {
    return null
  }
}

/** Returns whether the write actually succeeded — callers must not assume it did. */
function writeStoredMatch(match: Match | null): boolean {
  try {
    if (match) localStorage.setItem(STORAGE_KEY, JSON.stringify(match))
    else localStorage.removeItem(STORAGE_KEY)
    return true
  } catch {
    // Private browsing, storage quota exceeded, or storage disabled entirely.
    return false
  }
}

interface MatchStore {
  match: Match | null
  /** Timestamp of the last successful write to local storage, or null if none yet. */
  lastSavedAt: number | null
  /** True if the most recent write to local storage failed — scoring continues in-memory only. */
  saveFailed: boolean
  newMatch: (settings: MatchSettings, teamA: Player[], teamB: Player[]) => void
  startInnings: (
    battingTeam: 'A' | 'B',
    openingStrikerId: string,
    openingNonStrikerId: string,
    openingBowlerId: string,
  ) => void
  recordBall: (ball: Omit<BallEvent, 'id' | 'inningsIndex'>) => void
  undo: () => void
  discardMatch: () => void
  /** Replaces the current match wholesale — used to restore an exported backup. */
  loadMatch: (match: Match) => void
}

function useMatchStoreImpl(): MatchStore {
  const [match, setMatch] = useState<Match | null>(() => readStoredMatch())
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [saveFailed, setSaveFailed] = useState(false)

  useEffect(() => {
    if (match === null && lastSavedAt === null) return
    const ok = writeStoredMatch(match)
    setSaveFailed(!ok)
    if (ok) setLastSavedAt(Date.now())
  }, [match])

  const newMatch = useCallback((settings: MatchSettings, teamA: Player[], teamB: Player[]) => {
    setMatch(createMatch(settings, teamA, teamB))
  }, [])

  const startInnings = useCallback(
    (
      battingTeam: 'A' | 'B',
      openingStrikerId: string,
      openingNonStrikerId: string,
      openingBowlerId: string,
    ) => {
      setMatch((prev) => {
        if (!prev) return prev
        const innings: Innings = {
          battingTeam,
          openingStrikerId,
          openingNonStrikerId,
          openingBowlerId,
          balls: [],
        }
        const nextInnings = [...prev.innings]
        const index = nextInnings.length
        nextInnings[index] = innings
        return { ...prev, innings: nextInnings, currentInningsIndex: index as 0 | 1 }
      })
    },
    [],
  )

  const recordBall = useCallback((ball: Omit<BallEvent, 'id' | 'inningsIndex'>) => {
    setMatch((prev) => {
      if (!prev) return prev
      const inningsIndex = prev.currentInningsIndex
      const current = prev.innings[inningsIndex]
      if (!current) return prev
      const fullBall: BallEvent = { ...ball, id: crypto.randomUUID(), inningsIndex }
      const updatedInnings: Innings = { ...current, balls: [...current.balls, fullBall] }
      const nextInnings = [...prev.innings]
      nextInnings[inningsIndex] = updatedInnings
      return { ...prev, innings: nextInnings }
    })
  }, [])

  const undo = useCallback(() => {
    setMatch((prev) => {
      if (!prev) return prev
      const inningsIndex = prev.currentInningsIndex
      const current = prev.innings[inningsIndex]
      if (!current || current.balls.length === 0) return prev
      const updatedInnings: Innings = { ...current, balls: current.balls.slice(0, -1) }
      const nextInnings = [...prev.innings]
      nextInnings[inningsIndex] = updatedInnings
      return { ...prev, innings: nextInnings }
    })
  }, [])

  const discardMatch = useCallback(() => {
    setMatch(null)
    setLastSavedAt(null)
  }, [])

  const loadMatch = useCallback((imported: Match) => {
    setMatch(imported)
  }, [])

  return useMemo(
    () => ({
      match,
      lastSavedAt,
      saveFailed,
      newMatch,
      startInnings,
      recordBall,
      undo,
      discardMatch,
      loadMatch,
    }),
    [match, lastSavedAt, saveFailed, newMatch, startInnings, recordBall, undo, discardMatch, loadMatch],
  )
}

const MatchStoreContext = createContext<MatchStore | null>(null)

export function MatchStoreProvider({ children }: { children: ReactNode }) {
  const store = useMatchStoreImpl()
  return <MatchStoreContext.Provider value={store}>{children}</MatchStoreContext.Provider>
}

export function useMatchStore(): MatchStore {
  const ctx = useContext(MatchStoreContext)
  if (!ctx) throw new Error('useMatchStore must be used within MatchStoreProvider')
  return ctx
}
