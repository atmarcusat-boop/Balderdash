import type { Match } from '../../engine/types'
import { useMatchDerived, currentInnings } from '../../hooks/useDerivedMatch'
import { ScoreHeader } from '../scoring/ScoreHeader'
import { BatsmenBowlerPanel } from '../scoring/BatsmenBowlerPanel'
import { CurrentOverStrip } from '../scoring/CurrentOverStrip'
import { Card } from '../shared/Card'

export function LiveView({ match }: { match: Match }) {
  const derived = useMatchDerived(match)
  const innings = currentInnings(match, derived)

  if (!innings) {
    return (
      <div className="mx-auto max-w-md p-4">
        <Card>
          <p className="text-center text-[var(--color-ink-dim)]">Match hasn't started yet.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4 pb-8">
      <ScoreHeader match={match} innings={innings} target={derived.target} />
      <BatsmenBowlerPanel innings={innings} players={derived.players} />
      <CurrentOverStrip balls={innings.currentOverBalls} />
    </div>
  )
}
