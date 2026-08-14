import { addDays, mondayIndex, startOfDay, MONTH_LABELS } from './date'

// Builds a list of weeks (Mon -> Sun) covering the last `days` days, padded
// out to full weeks so the grid lines up cleanly. Each week is an array of
// 7 Date objects; dates after today are marked so they can render as blank
// spacers rather than data.
export function buildWeeks(days = 90) {
  const today = startOfDay(new Date())
  const rangeStart = addDays(today, -(days - 1))
  const gridStart = addDays(rangeStart, -mondayIndex(rangeStart))

  const weeks = []
  let cursor = gridStart
  while (cursor <= today) {
    const week = []
    for (let d = 0; d < 7; d += 1) {
      const date = addDays(cursor, d)
      week.push({ date, future: date > today })
    }
    weeks.push(week)
    cursor = addDays(cursor, 7)
  }
  return weeks
}

// One label per week column: the month name where a new month begins,
// blank otherwise, so labels read lightly across the top like "Jun Jul Aug".
export function monthLabelsForWeeks(weeks) {
  let lastMonth = null
  return weeks.map((week) => {
    const monday = week[0].date
    const month = monday.getMonth()
    if (month !== lastMonth) {
      lastMonth = month
      return MONTH_LABELS[month]
    }
    return ''
  })
}
