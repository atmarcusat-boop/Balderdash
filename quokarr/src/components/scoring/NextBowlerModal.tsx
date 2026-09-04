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

  return (
    <Modal open={open} title="Over complete — next bowler">
      <div className="flex flex-col gap-5">
        <p className="text-sm text-[var(--color-ink-dim)]">
          Same bowler can't bowl consecutive overs.
        </p>
        <div className="flex flex-wrap gap-2">
          {bowlingSquad
            .filter((p) => p.id !== excludeId)
            .map((p) => (
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
