import { useState } from 'react'
import type { Match } from '../../engine/types'
import { teamFor } from '../../engine/matchEngine'
import { useMatchDerived } from '../../hooks/useDerivedMatch'
import { useMatchStore } from '../../hooks/useMatchStore'
import { InningsScorecard } from '../summary/InningsScorecard'
import { Card, SectionLabel } from '../shared/Card'
import { Chip, PrimaryButton } from '../shared/Buttons'

export function SecondInningsSetup({ match }: { match: Match }) {
  const derived = useMatchDerived(match)
  const { startInnings } = useMatchStore()
  const firstInnings = derived.firstInnings!
  const battingTeam = firstInnings.battingTeam === 'A' ? 'B' : 'A'
  const battingSquad = teamFor(match, battingTeam)
  const bowlingSquad = teamFor(match, firstInnings.battingTeam)

  const [strikerId, setStrikerId] = useState('')
  const [nonStrikerId, setNonStrikerId] = useState('')
  const [bowlerId, setBowlerId] = useState('')

  const teamName = (t: 'A' | 'B') => (t === 'A' ? match.settings.teamAName : match.settings.teamBName)

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 p-4 pb-8">
      <Card className="bg-[var(--color-accent-dim)] text-center">
        <p className="font-bold text-[var(--color-accent)]">Innings break</p>
        <p className="mt-1 text-sm text-[var(--color-ink)]">
          {teamName(battingTeam)} need <span className="font-bold">{derived.target}</span> to win
        </p>
      </Card>

      <InningsScorecard match={match} innings={firstInnings} players={derived.players} inningsNumber={1} />

      <SectionLabel>Start 2nd innings</SectionLabel>
      <Card className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--color-ink-dim)]">On strike</span>
          <div className="flex flex-wrap gap-2">
            {battingSquad.map((p) => (
              <Chip key={p.id} active={strikerId === p.id} onClick={() => setStrikerId(p.id)}>
                {p.name}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--color-ink-dim)]">Non-striker</span>
          <div className="flex flex-wrap gap-2">
            {battingSquad
              .filter((p) => p.id !== strikerId)
              .map((p) => (
                <Chip key={p.id} active={nonStrikerId === p.id} onClick={() => setNonStrikerId(p.id)}>
                  {p.name}
                </Chip>
              ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--color-ink-dim)]">Opening bowler</span>
          <div className="flex flex-wrap gap-2">
            {bowlingSquad.map((p) => (
              <Chip key={p.id} active={bowlerId === p.id} onClick={() => setBowlerId(p.id)}>
                {p.name}
              </Chip>
            ))}
          </div>
        </div>
        <PrimaryButton
          disabled={!strikerId || !nonStrikerId || strikerId === nonStrikerId || !bowlerId}
          onClick={() => startInnings(battingTeam, strikerId, nonStrikerId, bowlerId)}
        >
          Start 2nd innings
        </PrimaryButton>
      </Card>
    </div>
  )
}
