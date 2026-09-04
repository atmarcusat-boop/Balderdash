import { motion } from 'framer-motion'
import type { BallEvent } from '../../engine/types'
import { ballLabel } from '../../engine/matchEngine'

export function CurrentOverStrip({ balls }: { balls: BallEvent[] }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-faint)]">
        This over
      </span>
      <div className="flex gap-1.5">
        {balls.length === 0 && <span className="text-sm text-[var(--color-ink-faint)]">—</span>}
        {balls.map((b) => {
          const isWicket = !!b.wicket
          const isExtra = b.kind !== 'normal'
          return (
            <motion.span
              key={b.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 400 }}
              className={`flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-2 text-xs font-bold tabular-nums ${
                isWicket
                  ? 'bg-[var(--color-danger-dim)] text-[var(--color-danger)]'
                  : isExtra
                    ? 'bg-[var(--color-surface-raised)] text-[var(--color-warn)]'
                    : b.runsBat === 4 || b.runsBat === 6
                      ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)]'
                      : 'bg-[var(--color-surface-raised)] text-[var(--color-ink)]'
              }`}
            >
              {ballLabel(b)}
            </motion.span>
          )
        })}
      </div>
    </div>
  )
}
