export type BallKind = 'normal' | 'wide' | 'noball' | 'bye' | 'legbye'

export type WicketType =
  | 'bowled'
  | 'caught'
  | 'lbw'
  | 'stumped'
  | 'hitwicket'
  | 'runout'
  | 'retired'

export interface Player {
  id: string
  name: string
}

export interface Wicket {
  type: WicketType
  /** Which batsman got out — needed for run outs, where either end can go. */
  playerOutId: string
  /** Fielder(s) involved, for caught / run out / stumped. Free text, optional. */
  fielder?: string
  /** New batsman's assigned end, resolved once the scorer confirms who's on strike. */
  incomingPlayerId?: string
}

export interface BallEvent {
  id: string
  inningsIndex: 0 | 1
  kind: BallKind
  strikerId: string
  nonStrikerId: string
  bowlerId: string
  /** Runs off the bat. For a run-out on a normal/no-ball delivery, this holds runs completed. */
  runsBat: number
  /** Runs run as byes/leg-byes/wide-overthrows, or byes taken off a no-ball. */
  runsExtra: number
  wicket?: Wicket
  /** Manual strike override chosen by the scorer after this ball (wicket / over-boundary edge cases). */
  strikeOverrideId?: string
}

export interface MatchSettings {
  teamAName: string
  teamBName: string
  oversLimit: number
  tossWonBy?: 'A' | 'B'
  tossChoice?: 'bat' | 'bowl'
}

export interface Innings {
  battingTeam: 'A' | 'B'
  openingStrikerId: string
  openingNonStrikerId: string
  openingBowlerId: string
  balls: BallEvent[]
}

export interface Match {
  id: string
  createdAt: number
  settings: MatchSettings
  teamA: Player[]
  teamB: Player[]
  innings: Innings[]
  currentInningsIndex: 0 | 1
}
