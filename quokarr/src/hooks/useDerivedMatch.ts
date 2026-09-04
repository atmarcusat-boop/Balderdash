import { useMemo } from 'react'
import type { Match } from '../engine/types'
import {
  allPlayers,
  computeMatchResult,
  deriveInnings,
  squadSizeFor,
  type InningsState,
  type MatchResult,
} from '../engine/matchEngine'

export interface MatchDerived {
  players: ReturnType<typeof allPlayers>
  firstInnings: InningsState | null
  secondInnings: InningsState | null
  target: number | undefined
  result: MatchResult | null
}

export function useMatchDerived(match: Match | null): MatchDerived {
  return useMemo(() => {
    const players = match ? allPlayers(match) : new Map()
    if (!match) {
      return { players, firstInnings: null, secondInnings: null, target: undefined, result: null }
    }

    const firstInningsRaw = match.innings[0]
    const firstInnings = firstInningsRaw
      ? deriveInnings(firstInningsRaw, {
          oversLimit: match.settings.oversLimit,
          squadSize: squadSizeFor(match, firstInningsRaw.battingTeam),
          players,
        })
      : null

    const target = firstInnings?.isComplete ? firstInnings.totalRuns + 1 : undefined

    const secondInningsRaw = match.innings[1]
    const secondInnings = secondInningsRaw
      ? deriveInnings(secondInningsRaw, {
          oversLimit: match.settings.oversLimit,
          squadSize: squadSizeFor(match, secondInningsRaw.battingTeam),
          target,
          players,
        })
      : null

    const result = computeMatchResult(match, firstInnings, secondInnings)

    return { players, firstInnings, secondInnings, target, result }
  }, [match])
}

export function currentInnings(match: Match, derived: MatchDerived): InningsState | null {
  return match.currentInningsIndex === 0 ? derived.firstInnings : derived.secondInnings
}
