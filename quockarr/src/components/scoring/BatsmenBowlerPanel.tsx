import type { Player } from '../../engine/types'
import type { InningsState } from '../../engine/matchEngine'
import { economy, oversLabel, strikeRate } from '../../engine/matchEngine'
import { Card } from '../shared/Card'

function BatsmanRow({
  player,
  stat,
  onStrike,
}: {
  player?: Player
  stat: { runs: number; balls: number } | undefined
  onStrike: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-[var(--color-ink)]">
        {onStrike && (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" aria-hidden />
        )}
        <span className={`truncate ${onStrike ? 'font-bold' : 'font-medium text-[var(--color-ink-dim)]'}`}>
          {player?.name ?? '—'}
        </span>
      </span>
      <span className="shrink-0 tabular-nums text-[var(--color-ink)]">
        <span className="font-bold">{stat?.runs ?? 0}</span>
        <span className="text-[var(--color-ink-faint)]"> ({stat?.balls ?? 0})</span>
      </span>
    </div>
  )
}

export function BatsmenBowlerPanel({
  innings,
  players,
}: {
  innings: InningsState
  players: Map<string, Player>
}) {
  const striker = innings.strikerId ? players.get(innings.strikerId) : undefined
  const nonStriker = innings.nonStrikerId ? players.get(innings.nonStrikerId) : undefined
  const strikerStat = innings.strikerId ? innings.battingPlayers.get(innings.strikerId) : undefined
  const nonStrikerStat = innings.nonStrikerId ? innings.battingPlayers.get(innings.nonStrikerId) : undefined

  const bowlerId = innings.currentBowlerId ?? innings.lastOverBowlerId
  const bowler = bowlerId ? players.get(bowlerId) : undefined
  const bowlerStat = bowlerId ? innings.bowlingFigures.get(bowlerId) : undefined

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <BatsmanRow player={striker} stat={strikerStat} onStrike={!!innings.strikerId} />
        {strikerStat && strikerStat.balls > 0 && (
          <div className="-mt-1.5 pl-3 text-xs text-[var(--color-ink-faint)] tabular-nums">
            SR {strikeRate(strikerStat.runs, strikerStat.balls).toFixed(1)}
          </div>
        )}
        <BatsmanRow player={nonStriker} stat={nonStrikerStat} onStrike={false} />
      </div>
      <div className="h-px bg-[var(--color-border)]" />
      <div className="flex items-center justify-between text-sm">
        <span className="truncate font-medium text-[var(--color-ink-dim)]">{bowler?.name ?? '—'}</span>
        <span className="tabular-nums text-[var(--color-ink)]">
          {bowlerStat ? (
            <>
              <span className="font-bold">
                {bowlerStat.wickets}/{bowlerStat.runsConceded}
              </span>{' '}
              <span className="text-[var(--color-ink-faint)]">
                ({oversLabel(bowlerStat.legalBalls)} ov, econ {economy(bowlerStat.runsConceded, bowlerStat.legalBalls).toFixed(2)})
              </span>
            </>
          ) : (
            '—'
          )}
        </span>
      </div>
    </Card>
  )
}
