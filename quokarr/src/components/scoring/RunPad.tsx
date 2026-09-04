const RUNS = [0, 1, 2, 3, 4, 5, 6]

export function RunPad({ onRun, disabled }: { onRun: (runs: number) => void; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {RUNS.map((r) => (
        <button
          key={r}
          disabled={disabled}
          onClick={() => onRun(r)}
          className={`min-h-16 rounded-2xl text-2xl font-black tabular-nums transition active:scale-90 disabled:opacity-30 ${
            r === 4 || r === 6
              ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)]'
              : 'bg-[var(--color-surface-raised)] text-[var(--color-ink)]'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  )
}
