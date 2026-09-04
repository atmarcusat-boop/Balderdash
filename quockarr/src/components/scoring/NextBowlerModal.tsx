import { useState } from 'react'
import type { Player } from '../../engine/types'
import { Modal } from '../shared/Modal'
import { Chip, PrimaryButton } from '../shared/Buttons'

export function NextBowlerModal({
  open,
  bowlingSquad,
  excludeId,
  onConfirm,
}: {
  open: boolean
  bowlingSquad: Player[]
  excludeId: string | null
  onConfirm: (bowlerId: string) => void
}) {
  const [selected, setSelected] = useState('')

  if (!open) return null

  // If excluding the last bowler would leave no one to bowl (a squad with only
  // one available bowler), relax the constraint rather than locking scoring up
  // entirely — a soft-lock mid-match is far worse than one repeated over.
  const restricted = bowlingSquad.filter((p) => p.id !== excludeId)
  const options = restricted.length > 0 ? restricted : bowlingSquad

  return (
    <Modal open={open} title="Over complete — next bowler">
      <div className="flex flex-col gap-5">
        <p className="text-sm text-[var(--color-ink-dim)]">
          {restricted.length > 0
            ? "Same bowler can't bowl consecutive overs."
            : 'Only one bowler is available, so the same-bowler restriction is relaxed.'}
        </p>
        <div className="flex flex-wrap gap-2">
          {options.map((p) => (
            <Chip key={p.id} active={selected === p.id} onClick={() => setSelected(p.id)}>
              {p.name}
            </Chip>
          ))}
        </div>
        <PrimaryButton disabled={!selected} onClick={() => onConfirm(selected)}>
          Start over
        </PrimaryButton>
      </div>
    </Modal>
  )
}
