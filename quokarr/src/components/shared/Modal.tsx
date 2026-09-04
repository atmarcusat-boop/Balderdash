import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose?: () => void
  title: string
  children: ReactNode
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="max-h-[88dvh] w-full overflow-y-auto rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-3xl"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--color-ink)]">{title}</h2>
              {onClose && (
                <button
                  onClick={onClose}
                  className="rounded-full px-2 py-1 text-sm text-[var(--color-ink-dim)] hover:text-[var(--color-ink)]"
                >
                  Cancel
                </button>
              )}
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
