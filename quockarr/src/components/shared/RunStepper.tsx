export function RunStepper({
  value,
  onChange,
  max = 6,
  min = 0,
  label,
}: {
  value: number
  onChange: (n: number) => void
  max?: number
  min?: number
  label?: string
}) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => i + min)
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-[var(--color-ink-dim)]">{label}</span>}
      <div className="grid grid-cols-4 gap-2">
        {options.map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`min-h-12 rounded-xl text-lg font-bold tabular-nums transition active:scale-90 ${
              value === n
                ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]'
                : 'bg-[var(--color-surface-raised)] text-[var(--color-ink)]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
