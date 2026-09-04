import { useEffect, useState } from 'react'
import type { BallKind, Player, WicketType } from '../../engine/types'
import type { InningsState } from '../../engine/matchEngine'
import { defaultStrikeAfterWicket, isLegalBall } from '../../engine/matchEngine'
import { Modal } from '../shared/Modal'
import { RunStepper } from '../shared/RunStepper'
import { Chip, PrimaryButton } from '../shared/Buttons'

const DISMISSALS: { type: WicketType; label: string }[] = [
  { type: 'bowled', label: 'Bowled' },
  { type: 'caught', label: 'Caught' },
  { type: 'lbw', label: 'LBW' },
  { type: 'stumped', label: 'Stumped' },
  { type: 'hitwicket', label: 'Hit Wicket' },
  { type: 'runout', label: 'Run Out' },
  { type: 'retired', label: 'Retired' },
]

const BALL_KINDS: { kind: BallKind; label: string }[] = [
  { kind: 'normal', label: 'Normal' },
  { kind: 'wide', label: 'Wide' },
  { kind: 'noball', label: 'No Ball' },
  { kind: 'bye', label: 'Bye' },
  { kind: 'legbye', label: 'Leg Bye' },
]

export interface WicketDraft {
  kind: BallKind
  runsBat: number
  runsExtra: number
  wicket: {
    type: WicketType
    playerOutId: string
    fielder?: string
    incomingPlayerId?: string
  }
  strikeOverrideId?: string
}

export function WicketModal({
  open,
  innings,
  players,
  battingSquad,
  onClose,
  onConfirm,
}: {
  open: boolean
  innings: InningsState
  players: Map<string, Player>
  battingSquad: Player[]
  onClose: () => void
  onConfirm: (draft: WicketDraft) => void
}) {
  const [stage, setStage] = useState<'dismissal' | 'incoming'>('dismissal')
  const [ballKind, setBallKind] = useState<BallKind>('normal')
  const [dismissalType, setDismissalType] = useState<WicketType>('bowled')
  const [playerOutId, setPlayerOutId] = useState(innings.strikerId ?? '')
  const [runsCompleted, setRunsCompleted] = useState(0)
  const [fielder, setFielder] = useState('')
  const [incomingId, setIncomingId] = useState('')
  const [strikeId, setStrikeId] = useState('')

  useEffect(() => {
    if (open) {
      setStage('dismissal')
      setBallKind('normal')
      setDismissalType('bowled')
      setPlayerOutId(innings.strikerId ?? '')
      setRunsCompleted(0)
      setFielder('')
      setIncomingId('')
      setStrikeId('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  const strikerId = innings.strikerId ?? ''
  const nonStrikerId = innings.nonStrikerId ?? ''
  const survivorId = playerOutId === strikerId ? nonStrikerId : strikerId
  const willEndInnings = innings.totalWickets + 1 >= innings.maxWickets
  const availableIncoming = battingSquad.filter(
    (p) => !innings.battingPlayers.get(p.id)?.out && p.id !== survivorId && p.id !== playerOutId,
  )

  const needsFielder = dismissalType === 'caught' || dismissalType === 'stumped' || dismissalType === 'runout'
  const needsRuns = dismissalType === 'runout'

  // If this delivery is also the 6th legal ball of the over, the engine applies
  // the automatic end-of-over swap on top of the wicket placement — so the
  // "who's on strike" default shown here must account for that too, or the
  // pre-highlighted choice will be backwards for exactly the case (a wicket on
  // the last ball of an over) the brief calls out as needing real confirmation.
  const legalBallsThisOverSoFar = innings.currentOverBalls.filter((b) => isLegalBall(b.kind)).length
  const willCompleteOver = isLegalBall(ballKind) && legalBallsThisOverSoFar === 5

  const computeDefaultStrike = (incoming: string) => {
    const placed = defaultStrikeAfterWicket(playerOutId, strikerId, nonStrikerId, incoming)
    return willCompleteOver ? placed.nonStrikerId : placed.strikerId
  }

  const goToIncoming = () => {
    if (willEndInnings || availableIncoming.length === 0) {
      confirm(undefined, undefined)
      return
    }
    setStage('incoming')
  }

  const confirm = (incomingPlayerId: string | undefined, strikerChoice: string | undefined) => {
    const draft: WicketDraft = {
      kind: ballKind,
      runsBat: needsRuns && (ballKind === 'normal' || ballKind === 'noball') ? runsCompleted : 0,
      runsExtra: needsRuns && (ballKind === 'wide' || ballKind === 'bye' || ballKind === 'legbye') ? runsCompleted : 0,
      wicket: {
        type: dismissalType,
        playerOutId,
        fielder: needsFielder && fielder.trim() ? fielder.trim() : undefined,
        incomingPlayerId,
      },
      strikeOverrideId: strikerChoice,
    }
    onConfirm(draft)
  }

  const defaultStrike = incomingId ? computeDefaultStrike(incomingId) : survivorId

  return (
    <Modal open={open} onClose={onClose} title="Wicket">
      {stage === 'dismissal' ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--color-ink-dim)]">Ball type</span>
            <div className="flex flex-wrap gap-2">
              {BALL_KINDS.map((b) => (
                <Chip key={b.kind} active={ballKind === b.kind} onClick={() => setBallKind(b.kind)}>
                  {b.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--color-ink-dim)]">How out</span>
            <div className="flex flex-wrap gap-2">
              {DISMISSALS.map((d) => (
                <Chip key={d.type} active={dismissalType === d.type} onClick={() => setDismissalType(d.type)}>
                  {d.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--color-ink-dim)]">Batsman out</span>
            <div className="flex gap-2">
              <Chip active={playerOutId === strikerId} onClick={() => setPlayerOutId(strikerId)} className="flex-1">
                {players.get(strikerId)?.name ?? 'Striker'}
              </Chip>
              <Chip active={playerOutId === nonStrikerId} onClick={() => setPlayerOutId(nonStrikerId)} className="flex-1">
                {players.get(nonStrikerId)?.name ?? 'Non-striker'}
              </Chip>
            </div>
          </div>
          {needsRuns && (
            <RunStepper value={runsCompleted} onChange={setRunsCompleted} label="Runs completed before the dismissal" />
          )}
          {needsFielder && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--color-ink-dim)]">Fielder (optional)</span>
              <input
                value={fielder}
                onChange={(e) => setFielder(e.target.value)}
                placeholder="Name"
                className="min-h-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 text-base outline-none focus:border-[var(--color-accent)]"
              />
            </label>
          )}
          <PrimaryButton onClick={goToIncoming} disabled={!playerOutId}>
            {willEndInnings || availableIncoming.length === 0 ? 'Confirm wicket' : 'Next: incoming batsman'}
          </PrimaryButton>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--color-ink-dim)]">Incoming batsman</span>
            <div className="flex flex-wrap gap-2">
              {availableIncoming.map((p) => (
                <Chip
                  key={p.id}
                  active={incomingId === p.id}
                  onClick={() => {
                    setIncomingId(p.id)
                    setStrikeId(computeDefaultStrike(p.id))
                  }}
                >
                  {p.name}
                </Chip>
              ))}
            </div>
          </div>
          {incomingId && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-[var(--color-ink-dim)]">On strike now</span>
              {willCompleteOver && (
                <p className="text-xs text-[var(--color-ink-faint)]">
                  This was the over's last ball, so ends swap too — check this carefully.
                </p>
              )}
              <div className="flex gap-2">
                <Chip active={strikeId === survivorId} onClick={() => setStrikeId(survivorId)} className="flex-1">
                  {players.get(survivorId)?.name}
                </Chip>
                <Chip active={strikeId === incomingId} onClick={() => setStrikeId(incomingId)} className="flex-1">
                  {players.get(incomingId)?.name}
                </Chip>
              </div>
            </div>
          )}
          <PrimaryButton
            disabled={!incomingId}
            onClick={() => confirm(incomingId, strikeId || defaultStrike)}
          >
            Confirm
          </PrimaryButton>
        </div>
      )}
    </Modal>
  )
}
