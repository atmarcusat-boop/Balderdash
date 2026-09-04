import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { BallEvent, Innings, Match, MatchSettings, Player } from '../engine/types'
import { createMatch } from '../engine/matchEngine'

const STORAGE_KEY = 'quockarr.match.v1'

function loadMatch(): Match | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Match
  } catch {
    return null
  }
}

function saveMatch(match: Match | null) {
  try {
    if (match) localStorage.setItem(STORAGE_KEY, JSON.stringify(match))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // localStorage unavailable (private mode, quota) — scoring still works in-memory for the session.
  }
}

interface MatchStore {
  match: Match | null
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
}

function useMatchStoreImpl(): MatchStore {
  const [match, setMatch] = useState<Match | null>(() => loadMatch())

  useEffect(() => {
    saveMatch(match)
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
  }, [])

  return useMemo(
    () => ({ match, newMatch, startInnings, recordBall, undo, discardMatch }),
    [match, newMatch, startInnings, recordBall, undo, discardMatch],
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
