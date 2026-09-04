import { useEffect, useState } from 'react'
import type { BallKind } from '../../engine/types'
import { Modal } from '../shared/Modal'
import { RunStepper } from '../shared/RunStepper'
import { Chip, PrimaryButton } from '../shared/Buttons'

export type ExtraKind = 'wide' | 'bye' | 'legbye' | 'noball'

const TITLES: Record<ExtraKind, string> = {
  wide: 'Wide',
  bye: 'Bye',
  legbye: 'Leg Bye',
  noball: 'No Ball',
}

export function ExtraModal({
  kind,
  onClose,
  onConfirm,
}: {
  kind: ExtraKind | null
  onClose: () => void
  onConfirm: (draft: { kind: BallKind; runsBat: number; runsExtra: number }) => void
}) {
  const [runs, setRuns] = useState(0)
  const [noballMode, setNoballMode] = useState<'bat' | 'bye'>('bat')

  useEffect(() => {
    if (kind) {
      setRuns(kind === 'bye' || kind === 'legbye' ? 1 : 0)
      setNoballMode('bat')
    }
  }, [kind])

  if (!kind) return null

  const confirm = () => {
    if (kind === 'noball') {
      onConfirm({
        kind: 'noball',
        runsBat: noballMode === 'bat' ? runs : 0,
        runsExtra: noballMode === 'bye' ? runs : 0,
      })
    } else if (kind === 'wide') {
      onConfirm({ kind: 'wide', runsBat: 0, runsExtra: runs })
    } else {
      onConfirm({ kind, runsBat: 0, runsExtra: runs })
    }
  }

  return (
    <Modal open={!!kind} onClose={onClose} title={TITLES[kind]}>
      <div className="flex flex-col gap-5">
        {kind === 'noball' && (
          <div className="flex gap-2">
            <Chip active={noballMode === 'bat'} onClick={() => setNoballMode('bat')} className="flex-1">
              Runs off bat
            </Chip>
            <Chip active={noballMode === 'bye'} onClick={() => setNoballMode('bye')} className="flex-1">
              Byes
            </Chip>
          </div>
        )}
        <RunStepper
          value={runs}
          onChange={setRuns}
          min={kind === 'bye' || kind === 'legbye' ? 1 : 0}
          label={
            kind === 'wide'
              ? 'Runs run (on top of the penalty)'
              : kind === 'noball'
                ? noballMode === 'bat'
                  ? 'Runs off the bat'
                  : 'Byes run'
                : 'Runs'
          }
        />
        <PrimaryButton onClick={confirm}>Confirm</PrimaryButton>
      </div>
    </Modal>
  )
}
