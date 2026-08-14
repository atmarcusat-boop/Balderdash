import { MONTH_LABELS, startOfDay } from './date'

// Builds the last `count` calendar months (current month first, going
// backward), each with every day in that month so a whole month renders
// as one full-width row. Days after today are marked `future` so they
// render as blank rather than data. Short months (28-30 days) just end
// early — callers pad to a fixed 31-column grid so every row still lines
// up on the same day-of-month.
export function buildMonths(count = 3) {
  const today = startOfDay(new Date())
  const months = []

  for (let i = 0; i < count; i += 1) {
    const year = today.getFullYear()
    const month = today.getMonth() - i
    const first = new Date(year, month, 1)
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()

    const days = []
    for (let d = 1; d <= daysInMonth; d += 1) {
      const date = new Date(first.getFullYear(), first.getMonth(), d)
      days.push({ date, future: date > today })
    }

    months.push({
      key: `${first.getFullYear()}-${first.getMonth()}`,
      label: MONTH_LABELS[first.getMonth()],
      days,
    })
  }

  return months
}
