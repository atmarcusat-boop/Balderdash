import type { ButtonHTMLAttributes, ReactNode } from 'react'

type BaseProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }

export function PrimaryButton({ children, className = '', ...rest }: BaseProps) {
  return (
    <button
      className={`min-h-12 w-full rounded-xl bg-[var(--color-accent)] px-4 py-3 text-base font-bold text-[var(--color-accent-ink)] transition active:scale-[0.97] active:brightness-90 disabled:opacity-40 disabled:active:scale-100 ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({ children, className = '', ...rest }: BaseProps) {
  return (
    <button
      className={`min-h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-base font-semibold text-[var(--color-ink)] transition active:scale-[0.97] active:bg-[var(--color-border)] disabled:opacity-40 disabled:active:scale-100 ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function IconButton({
  children,
  className = '',
  label,
  ...rest
}: BaseProps & { label?: string }) {
  return (
    <button
      aria-label={label}
      className={`flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-ink)] transition active:scale-90 active:bg-[var(--color-border)] disabled:opacity-30 ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Chip({
  children,
  className = '',
  active = false,
  ...rest
}: BaseProps & { active?: boolean }) {
  return (
    <button
      className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition active:scale-95 disabled:opacity-30 disabled:active:scale-100 ${
        active
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-ink)]'
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
