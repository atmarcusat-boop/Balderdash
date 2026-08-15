// The three things a card can be answered with. Values are stored as-is
// in checkins[date][itemId]. Older data from before "partial" existed
// stored plain booleans (true/false) — weight() and isFilled()/isPartial()
// below treat `true` the same as 'yes' so that data still renders correctly.

export const YES = 'yes'
export const NO = 'no'
export const PARTIAL = 'partial'

export function isFilled(value) {
  return value === YES || value === true
}

export function isPartial(value) {
  return value === PARTIAL
}

// How much a value counts toward "how many things got done today" —
// a full point for yes, half for partial, nothing otherwise.
export function weight(value) {
  if (isFilled(value)) return 1
  if (isPartial(value)) return 0.5
  return 0
}
