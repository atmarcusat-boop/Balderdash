import type { Match } from '../../engine/types'
import type { InningsState } from '../../engine/matchEngine'
import { oversLabel, runRate, oversAsFraction } from '../../engine/matchEngine'
import { Card } from '../shared/Card'

export function ScoreHeader({
  match,
  innings,
  target,
}: {
  match: Match
  innings: InningsState
  target?: number
}) {
  const teamName = innings.battingTeam === 'A' ? match.settings.teamAName : match.settings.teamBName
  const rr = runRate(innings.totalRuns, innings.legalBallsBowled)
  const isSecond = match.currentInningsIndex === 1

  const oversRemaining = match.settings.oversLimit - oversAsFraction(innings.legalBallsBowled)
  const runsRequired = target !== undefined ? Math.max(target - innings.totalRuns, 0) : undefined
  const ballsRemaining = match.settings.oversLimit * 6 - innings.legalBallsBowled
  const reqRR =
    isSecond && runsRequired !== undefined && oversRemaining > 0
      ? runsRequired / oversRemaining
      : undefined

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-dim)]">
          {teamName}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)]">
          <span className="h-2 w-2 animate-pulse-live rounded-full bg-[var(--color-accent)]" />
          LIVE
        </span>
      </div>
      <div className="flex items-end gap-3">
        <span className="text-6xl font-black tabular-nums leading-none text-[var(--color-ink)]">
          {innings.totalRuns}
          <span className="text-3xl text-[var(--color-ink-dim)]">/{innings.totalWickets}</span>
        </span>
        <div className="flex flex-col pb-1 text-sm text-[var(--color-ink-dim)]">
          <span className="tabular-nums">{oversLabel(innings.legalBallsBowled)} overs</span>
          <span className="tabular-nums">RR {rr.toFixed(2)}</span>
        </div>
      </div>
      {isSecond && target !== undefined && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-[var(--color-surface-raised)] px-3 py-2 text-sm text-[var(--color-ink-dim)]">
          <span>
            Target <span className="font-bold tabular-nums text-[var(--color-ink)]">{target}</span>
          </span>
          <span>
            Need <span className="font-bold tabular-nums text-[var(--color-ink)]">{runsRequired}</span> off{' '}
            <span className="font-bold tabular-nums text-[var(--color-ink)]">{Math.max(ballsRemaining, 0)}</span>
          </span>
          {reqRR !== undefined && (
            <span>
              RRR <span className="font-bold tabular-nums text-[var(--color-ink)]">{reqRR.toFixed(2)}</span>
            </span>
          )}
        </div>
      )}
    </Card>
  )
}
