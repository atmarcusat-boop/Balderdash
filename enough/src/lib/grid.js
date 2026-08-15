import { MONTH_LABELS, startOfDay } from './date'

// Builds the last `count` calendar months (current month first, going
// backward). Each month only includes the days that have actually
// happened — the current month stops at today, not day 31 — so every
// row's squares stretch to fill the full row width instead of trailing
// off into blank space. Day-of-month no longer lines up column-for-column
// between rows as a result, but every row reads as "full" the moment it's
// drawn.
export function buildMonths(count = 3) {
  const today = startOfDay(new Date())
  const months = []

  for (let i = 0; i < count; i += 1) {
    const year = today.getFullYear()
    const month = today.getMonth() - i
    const first = new Date(year, month, 1)
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
    const isCurrentMonth = i === 0
    const lastDay = isCurrentMonth ? today.getDate() : daysInMonth

    const days = []
    for (let d = 1; d <= lastDay; d += 1) {
      days.push({ date: new Date(first.getFullYear(), first.getMonth(), d) })
    }

    months.push({
      key: `${first.getFullYear()}-${first.getMonth()}`,
      label: MONTH_LABELS[first.getMonth()],
      days,
    })
  }

  return months
}
