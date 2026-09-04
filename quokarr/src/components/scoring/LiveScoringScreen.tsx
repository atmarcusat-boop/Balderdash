import { useEffect, useState } from 'react'
import { ArrowLeftRight, Undo2 } from 'lucide-react'
import type { Match, BallKind } from '../../engine/types'
import type { InningsState } from '../../engine/matchEngine'
import { teamFor } from '../../engine/matchEngine'
import { useMatchStore } from '../../hooks/useMatchStore'
import { useMatchDerived } from '../../hooks/useDerivedMatch'
import { ScoreHeader } from './ScoreHeader'
import { BatsmenBowlerPanel } from './BatsmenBowlerPanel'
import { CurrentOverStrip } from './CurrentOverStrip'
import { RunPad } from './RunPad'
import { ExtraModal, type ExtraKind } from './ExtraModal'
import { WicketModal, type WicketDraft } from './WicketModal'
import { NextBowlerModal } from './NextBowlerModal'
import { Chip, IconButton } from '../shared/Buttons'

export function LiveScoringScreen({ match }: { match: Match }) {
  const { recordBall, undo } = useMatchStore()
  const derived = useMatchDerived(match)
  const innings = (match.currentInningsIndex === 0 ? derived.firstInnings : derived.secondInnings) as InningsState

  const [extraKind, setExtraKind] = useState<ExtraKind | null>(null)
  const [wicketOpen, setWicketOpen] = useState(false)
  const [pendingBowlerId, setPendingBowlerId] = useState<string | null>(null)
  const [pendingSwap, setPendingSwap] = useState(false)

  useEffect(() => {
    if (innings.currentBowlerId) setPendingBowlerId(null)
  }, [innings.currentBowlerId])

  const rawInnings = match.innings[match.currentInningsIndex]
  const battingSquad = teamFor(match, innings.battingTeam)
  const bowlingSquad = teamFor(match, innings.battingTeam === 'A' ? 'B' : 'A')
  const effectiveBowlerId = innings.currentBowlerId ?? pendingBowlerId
  const canScore = !!innings.strikerId && !!innings.nonStrikerId && !!effectiveBowlerId

  const displayInnings: InningsState = pendingSwap
    ? { ...innings, strikerId: innings.nonStrikerId, nonStrikerId: innings.strikerId }
    : innings

  const submit = (fields: {
    kind: BallKind
    runsBat: number
    runsExtra: number
    wicket?: WicketDraft['wicket']
    strikeOverrideId?: string
  }) => {
    if (!innings.strikerId || !innings.nonStrikerId || !effectiveBowlerId) return
    recordBall({
      kind: fields.kind,
      strikerId: innings.strikerId,
      nonStrikerId: innings.nonStrikerId,
      bowlerId: effectiveBowlerId,
      runsBat: fields.runsBat,
      runsExtra: fields.runsExtra,
      wicket: fields.wicket,
      strikeOverrideId: fields.strikeOverrideId ?? (pendingSwap ? innings.nonStrikerId : undefined),
    })
    setPendingSwap(false)
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4 pb-6">
      <ScoreHeader match={match} innings={innings} target={derived.target} />
      <BatsmenBowlerPanel innings={displayInnings} players={derived.players} />
      <CurrentOverStrip balls={innings.currentOverBalls} />

      <div className="flex items-center gap-2">
        <IconButton
          label="Undo last ball"
          onClick={undo}
          disabled={rawInnings.balls.length === 0}
          className="shrink-0"
        >
          <Undo2 size={18} />
        </IconButton>
        <IconButton
          label="Swap strike"
          onClick={() => setPendingSwap((v) => !v)}
          className={pendingSwap ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'shrink-0'}
        >
          <ArrowLeftRight size={18} />
        </IconButton>
        <span className="text-xs text-[var(--color-ink-faint)]">
          {pendingSwap ? 'Strike will swap on the next ball' : ''}
        </span>
      </div>

      <RunPad disabled={!canScore} onRun={(runs) => submit({ kind: 'normal', runsBat: runs, runsExtra: 0 })} />

      <div className="grid grid-cols-4 gap-2.5">
        <Chip disabled={!canScore} onClick={() => setExtraKind('wide')}>
          Wide
        </Chip>
        <Chip disabled={!canScore} onClick={() => setExtraKind('noball')}>
          No Ball
        </Chip>
        <Chip disabled={!canScore} onClick={() => setExtraKind('bye')}>
          Bye
        </Chip>
        <Chip disabled={!canScore} onClick={() => setExtraKind('legbye')}>
          Leg Bye
        </Chip>
      </div>

      <button
        disabled={!canScore}
        onClick={() => setWicketOpen(true)}
        className="min-h-14 rounded-2xl bg-[var(--color-danger-dim)] text-lg font-black tracking-wide text-[var(--color-danger)] transition active:scale-[0.97] disabled:opacity-30"
      >
        WICKET
      </button>

      <ExtraModal
        kind={extraKind}
        onClose={() => setExtraKind(null)}
        onConfirm={(draft) => {
          submit(draft)
          setExtraKind(null)
        }}
      />

      <WicketModal
        open={wicketOpen}
        innings={innings}
        players={derived.players}
        battingSquad={battingSquad}
        onClose={() => setWicketOpen(false)}
        onConfirm={(draft) => {
          submit(draft)
          setWicketOpen(false)
        }}
      />

      <NextBowlerModal
        open={innings.needsNewBowler && !pendingBowlerId}
        bowlingSquad={bowlingSquad}
        excludeId={innings.lastOverBowlerId}
        onConfirm={(bowlerId) => setPendingBowlerId(bowlerId)}
      />
    </div>
  )
}
