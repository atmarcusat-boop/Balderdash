import type {
  BallEvent,
  BallKind,
  Innings,
  Match,
  MatchSettings,
  Player,
  WicketType,
} from './types'

export const isLegalBall = (kind: BallKind) => kind !== 'wide' && kind !== 'noball'

export const countsAsBallFaced = (kind: BallKind) => kind !== 'wide'

/** Runs physically run between the wickets on this ball (drives strike rotation). */
export const physicalRunsRun = (ball: BallEvent) => ball.runsBat + ball.runsExtra

export const teamRuns = (ball: BallEvent): number => {
  switch (ball.kind) {
    case 'wide':
      return 1 + ball.runsExtra
    case 'noball':
      return 1 + ball.runsBat + ball.runsExtra
    case 'bye':
    case 'legbye':
      return ball.runsExtra
    case 'normal':
    default:
      return ball.runsBat
  }
}

export const bowlerRuns = (ball: BallEvent): number => {
  switch (ball.kind) {
    case 'wide':
      return 1 + ball.runsExtra
    case 'noball':
      return 1 + ball.runsBat
    case 'bye':
    case 'legbye':
      return 0
    case 'normal':
    default:
      return ball.runsBat
  }
}

export const batsmanRuns = (ball: BallEvent): number => {
  if (ball.kind === 'normal' || ball.kind === 'noball') return ball.runsBat
  return 0
}

export interface ExtrasTally {
  byes: number
  legbyes: number
  wides: number
  noballs: number
  total: number
}

export interface BatsmanStat {
  id: string
  runs: number
  balls: number
  fours: number
  sixes: number
  out: boolean
  howOut?: string
  battedAt: number
}

export interface BowlerStat {
  id: string
  legalBalls: number
  runsConceded: number
  wickets: number
  maidens: number
}

export interface FallOfWicket {
  wicketNumber: number
  runs: number
  overLabel: string
  playerOutId: string
  howOut: string
}

export interface InningsState {
  battingTeam: 'A' | 'B'
  battingPlayers: Map<string, BatsmanStat>
  battingOrder: string[]
  bowlingFigures: Map<string, BowlerStat>
  bowlingOrder: string[]
  extras: ExtrasTally
  totalRuns: number
  totalWickets: number
  legalBallsBowled: number
  maxWickets: number
  fallOfWickets: FallOfWicket[]
  currentOverBalls: BallEvent[]
  strikerId: string | null
  nonStrikerId: string | null
  currentBowlerId: string | null
  lastOverBowlerId: string | null
  isComplete: boolean
  completionReason: 'allout' | 'oversout' | 'target-reached' | null
  needsNewBowler: boolean
  needsNewBatsman: boolean
}

export const oversLabel = (legalBalls: number) => {
  const overs = Math.floor(legalBalls / 6)
  const balls = legalBalls % 6
  return `${overs}.${balls}`
}

export const oversAsFraction = (legalBalls: number) => legalBalls / 6

export const strikeRate = (runs: number, balls: number) =>
  balls === 0 ? 0 : (runs / balls) * 100

export const economy = (runsConceded: number, legalBalls: number) =>
  legalBalls === 0 ? 0 : runsConceded / oversAsFraction(legalBalls)

export const runRate = (runs: number, legalBalls: number) =>
  legalBalls === 0 ? 0 : runs / oversAsFraction(legalBalls)

export const howOutLabel = (
  type: WicketType,
  bowlerId: string,
  fielderNote: string | undefined,
  players: Map<string, Player>,
): string => {
  const bowlerName = players.get(bowlerId)?.name ?? 'bowler'
  switch (type) {
    case 'bowled':
      return `b ${bowlerName}`
    case 'caught':
      return fielderNote ? `c ${fielderNote} b ${bowlerName}` : `c & b ${bowlerName}`
    case 'lbw':
      return `lbw b ${bowlerName}`
    case 'stumped':
      return fielderNote ? `st ${fielderNote} b ${bowlerName}` : `st b ${bowlerName}`
    case 'hitwicket':
      return `hit wicket b ${bowlerName}`
    case 'runout':
      return fielderNote ? `run out (${fielderNote})` : 'run out'
    case 'retired':
      return 'retired'
    default:
      return type
  }
}

export const ballLabel = (ball: BallEvent): string => {
  let base: string
  switch (ball.kind) {
    case 'wide':
      base = ball.runsExtra > 0 ? `wd+${ball.runsExtra}` : 'wd'
      break
    case 'noball': {
      const extra = ball.runsBat + ball.runsExtra
      base = extra > 0 ? `nb+${extra}` : 'nb'
      break
    }
    case 'bye':
      base = `${ball.runsExtra}b`
      break
    case 'legbye':
      base = `${ball.runsExtra}lb`
      break
    case 'normal':
    default:
      base = String(ball.runsBat)
  }
  if (ball.wicket) base = `${base} W`
  return base
}

/** Who ends up on strike by default when a batsman is replaced (before any scorer override). */
export function defaultStrikeAfterWicket(
  playerOutId: string,
  strikerId: string,
  nonStrikerId: string,
  incomingPlayerId: string,
): { strikerId: string; nonStrikerId: string } {
  const survivorId = playerOutId === strikerId ? nonStrikerId : strikerId
  return playerOutId === strikerId
    ? { strikerId: incomingPlayerId, nonStrikerId: survivorId }
    : { strikerId: survivorId, nonStrikerId: incomingPlayerId }
}

const emptyExtras = (): ExtrasTally => ({ byes: 0, legbyes: 0, wides: 0, noballs: 0, total: 0 })

const getOrCreateBatsman = (state: InningsState, id: string): BatsmanStat => {
  let stat = state.battingPlayers.get(id)
  if (!stat) {
    stat = { id, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, battedAt: state.battingOrder.length }
    state.battingPlayers.set(id, stat)
    state.battingOrder.push(id)
  }
  return stat
}

const getOrCreateBowler = (state: InningsState, id: string): BowlerStat => {
  let stat = state.bowlingFigures.get(id)
  if (!stat) {
    stat = { id, legalBalls: 0, runsConceded: 0, wickets: 0, maidens: 0 }
    state.bowlingFigures.set(id, stat)
    state.bowlingOrder.push(id)
  }
  return stat
}

interface DeriveOptions {
  oversLimit: number
  squadSize: number
  target?: number
  players: Map<string, Player>
}

/**
 * Replay a ball-by-ball log into full innings state. This is the single
 * source of truth for every derived number — undo just drops the last
 * ball and calls this again, so nothing can drift out of sync.
 */
export function deriveInnings(innings: Innings, options: DeriveOptions): InningsState {
  const state: InningsState = {
    battingTeam: innings.battingTeam,
    battingPlayers: new Map(),
    battingOrder: [],
    bowlingFigures: new Map(),
    bowlingOrder: [],
    extras: emptyExtras(),
    totalRuns: 0,
    totalWickets: 0,
    legalBallsBowled: 0,
    maxWickets: options.squadSize - 1,
    fallOfWickets: [],
    currentOverBalls: [],
    strikerId: innings.openingStrikerId,
    nonStrikerId: innings.openingNonStrikerId,
    currentBowlerId: innings.openingBowlerId,
    lastOverBowlerId: null,
    isComplete: false,
    completionReason: null,
    needsNewBowler: false,
    needsNewBatsman: false,
  }
  if (innings.openingStrikerId) getOrCreateBatsman(state, innings.openingStrikerId)
  if (innings.openingNonStrikerId) getOrCreateBatsman(state, innings.openingNonStrikerId)
  if (innings.openingBowlerId) getOrCreateBowler(state, innings.openingBowlerId)

  let overRunsForMaiden = 0
  let ballsSinceOverStart = 0

  for (const ball of innings.balls) {
    const striker = getOrCreateBatsman(state, ball.strikerId)
    getOrCreateBatsman(state, ball.nonStrikerId)
    const bowler = getOrCreateBowler(state, ball.bowlerId)

    const runsToTeam = teamRuns(ball)
    const runsToBowler = bowlerRuns(ball)
    const runsToBat = batsmanRuns(ball)

    state.totalRuns += runsToTeam
    bowler.runsConceded += runsToBowler
    overRunsForMaiden += runsToBowler

    if (countsAsBallFaced(ball.kind)) striker.balls += 1
    striker.runs += runsToBat
    if (runsToBat === 4) striker.fours += 1
    if (runsToBat === 6) striker.sixes += 1

    switch (ball.kind) {
      case 'bye':
        state.extras.byes += ball.runsExtra
        break
      case 'legbye':
        state.extras.legbyes += ball.runsExtra
        break
      case 'wide':
        state.extras.wides += 1 + ball.runsExtra
        break
      case 'noball':
        state.extras.noballs += 1
        if (ball.runsExtra > 0) state.extras.byes += ball.runsExtra
        break
    }
    state.extras.total =
      state.extras.byes + state.extras.legbyes + state.extras.wides + state.extras.noballs

    const legal = isLegalBall(ball.kind)
    if (legal) {
      state.legalBallsBowled += 1
      bowler.legalBalls += 1
      ballsSinceOverStart += 1
    }

    let strikerId = ball.strikerId
    let nonStrikerId = ball.nonStrikerId

    if (ball.wicket) {
      const dismissed = getOrCreateBatsman(state, ball.wicket.playerOutId)
      dismissed.out = true
      dismissed.howOut = howOutLabel(ball.wicket.type, ball.bowlerId, ball.wicket.fielder, options.players)
      state.totalWickets += 1
      if (ball.wicket.type !== 'runout') bowler.wickets += 1
      state.fallOfWickets.push({
        wicketNumber: state.totalWickets,
        runs: state.totalRuns,
        overLabel: oversLabel(state.legalBallsBowled),
        playerOutId: ball.wicket.playerOutId,
        howOut: dismissed.howOut,
      })

      if (ball.wicket.incomingPlayerId) {
        getOrCreateBatsman(state, ball.wicket.incomingPlayerId)
        // Default placement: incoming batsman takes the dismissed player's end.
        // A strikeOverrideId (crossed run outs, wicket on the last ball of an
        // over, etc.) is applied uniformly below, after any over-boundary swap.
        const placed = defaultStrikeAfterWicket(
          ball.wicket.playerOutId,
          ball.strikerId,
          ball.nonStrikerId,
          ball.wicket.incomingPlayerId,
        )
        strikerId = placed.strikerId
        nonStrikerId = placed.nonStrikerId
      } else {
        // No replacement chosen yet — awaiting UI input before the next ball.
        const survivorId = ball.wicket.playerOutId === ball.strikerId ? ball.nonStrikerId : ball.strikerId
        strikerId = survivorId
        nonStrikerId = survivorId
      }
    } else if (physicalRunsRun(ball) % 2 === 1) {
      ;[strikerId, nonStrikerId] = [nonStrikerId, strikerId]
    }

    if (legal && ballsSinceOverStart === 6) {
      ;[strikerId, nonStrikerId] = [nonStrikerId, strikerId]
      state.lastOverBowlerId = ball.bowlerId
      if (overRunsForMaiden === 0) bowler.maidens += 1
      overRunsForMaiden = 0
      ballsSinceOverStart = 0
      state.currentOverBalls = []
    } else {
      state.currentOverBalls.push(ball)
    }

    // The scorer's explicit call on who's on strike always wins, applied
    // last so it overrides both the default wicket placement and the
    // automatic end-of-over swap.
    if (ball.strikeOverrideId && strikerId !== ball.strikeOverrideId) {
      ;[strikerId, nonStrikerId] = [nonStrikerId, strikerId]
    }

    state.strikerId = strikerId
    state.nonStrikerId = nonStrikerId
    state.currentBowlerId = legal && ballsSinceOverStart === 0 ? null : ball.bowlerId
  }

  const oversBowledOut = state.legalBallsBowled >= options.oversLimit * 6
  const allOut = state.totalWickets >= state.maxWickets
  const targetReached = options.target !== undefined && state.totalRuns >= options.target

  if (targetReached) {
    state.isComplete = true
    state.completionReason = 'target-reached'
  } else if (allOut) {
    state.isComplete = true
    state.completionReason = 'allout'
  } else if (oversBowledOut) {
    state.isComplete = true
    state.completionReason = 'oversout'
  }

  if (!state.isComplete) {
    state.needsNewBowler = ballsSinceOverStart === 0 && state.legalBallsBowled > 0 && !state.currentBowlerId
    const lastBall = innings.balls[innings.balls.length - 1]
    state.needsNewBatsman = !!lastBall?.wicket && !lastBall.wicket.incomingPlayerId
  }

  return state
}

export function createMatch(settings: MatchSettings, teamA: Player[], teamB: Player[]): Match {
  return {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    settings,
    teamA,
    teamB,
    innings: [],
    currentInningsIndex: 0,
  }
}

export const allPlayers = (match: Match): Map<string, Player> => {
  const map = new Map<string, Player>()
  for (const p of match.teamA) map.set(p.id, p)
  for (const p of match.teamB) map.set(p.id, p)
  return map
}

export const teamFor = (match: Match, side: 'A' | 'B'): Player[] =>
  side === 'A' ? match.teamA : match.teamB

export const squadSizeFor = (match: Match, side: 'A' | 'B'): number => teamFor(match, side).length

export interface MatchResult {
  text: string
  winner: 'A' | 'B' | 'tie' | null
}

export function computeMatchResult(
  match: Match,
  firstInningsState: InningsState | null,
  secondInningsState: InningsState | null,
): MatchResult | null {
  if (!firstInningsState || !secondInningsState) return null
  if (!secondInningsState.isComplete) return null

  const teamName = (side: 'A' | 'B') =>
    side === 'A' ? match.settings.teamAName : match.settings.teamBName

  const firstRuns = firstInningsState.totalRuns
  const secondRuns = secondInningsState.totalRuns
  const chasingTeam = secondInningsState.battingTeam
  const settingTeam = firstInningsState.battingTeam

  if (secondRuns > firstRuns) {
    const wicketsInHand = secondInningsState.maxWickets - secondInningsState.totalWickets
    return {
      winner: chasingTeam,
      text: `${teamName(chasingTeam)} won by ${wicketsInHand} wicket${wicketsInHand === 1 ? '' : 's'}`,
    }
  }
  if (secondRuns < firstRuns) {
    return {
      winner: settingTeam,
      text: `${teamName(settingTeam)} won by ${firstRuns - secondRuns} run${firstRuns - secondRuns === 1 ? '' : 's'}`,
    }
  }
  return { winner: 'tie', text: 'Match tied' }
}
