import { ITEMS } from '../data/items'
import { addDays, dateKey, todayKey } from './date'

const KEYS = {
  onboarded: 'enough:onboarded',
  checkins: 'enough:checkins',
}

export function loadOnboarded() {
  return localStorage.getItem(KEYS.onboarded) === 'true'
}

export function saveOnboarded(value) {
  localStorage.setItem(KEYS.onboarded, value ? 'true' : 'false')
}

export function loadCheckins() {
  try {
    const raw = localStorage.getItem(KEYS.checkins)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveCheckins(checkins) {
  localStorage.setItem(KEYS.checkins, JSON.stringify(checkins))
}

export function clearAllData() {
  localStorage.removeItem(KEYS.onboarded)
  localStorage.removeItem(KEYS.checkins)
}

// Dev/test helper: fills the past `days` (not including today) with
// plausible random check-ins, so the Progress grid has something to show
// straight away. Each item gets its own random likelihood so the grid
// reads with natural, uneven gaps rather than a uniform noise pattern.
export function seedRandomData(days = 90) {
  const checkins = loadCheckins()
  const today = new Date()

  const likelihood = Object.fromEntries(
    ITEMS.map((item) => [item.id, 0.35 + Math.random() * 0.5]),
  )

  for (let i = 1; i <= days; i += 1) {
    const key = dateKey(addDays(today, -i))
    if (checkins[key]) continue // don't clobber real history
    const entry = {}
    ITEMS.forEach((item) => {
      entry[item.id] = Math.random() < likelihood[item.id]
    })
    checkins[key] = entry
  }

  saveCheckins(checkins)
  return checkins
}

export { todayKey }
