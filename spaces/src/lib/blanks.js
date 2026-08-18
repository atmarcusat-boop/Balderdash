// Turns a word into a reveal/hide pattern for the puzzle card. `difficulty`
// is 0 (first word, easy) to 1 (final word, hard). No word ever reveals more
// than HINT_CAP_FRACTION of its letters, regardless of difficulty — that cap
// is computed as an integer letter budget up front, and difficulty only
// controls how much of that budget gets spent (full budget at easy, a
// quarter of it at hard). Within budget, the first letter is a soft
// preference (an easy-mode anchor) rather than a guarantee, since for short
// words even one reveal can already be the whole budget.

const HINT_CAP_FRACTION = 0.2
const EASY_BUDGET_USE = 1
const HARD_BUDGET_USE = 0.25
const EASY_FIRST_LETTER_CHANCE = 1
const HARD_FIRST_LETTER_CHANCE = 0.25

function lerp(a, b, t) {
  return a + (b - a) * t
}

export function buildBlanks(word, difficulty = 0) {
  const t = Math.min(1, Math.max(0, difficulty))
  const letters = word.split('')
  const maxReveal = Math.floor(letters.length * HINT_CAP_FRACTION)
  const revealBudget = Math.max(0, Math.round(maxReveal * lerp(EASY_BUDGET_USE, HARD_BUDGET_USE, t)))
  const firstLetterChance = lerp(EASY_FIRST_LETTER_CHANCE, HARD_FIRST_LETTER_CHANCE, t)

  const blanks = letters.map((char) => ({ char, revealed: false }))

  if (revealBudget > 0) {
    const picks = []
    if (Math.random() < firstLetterChance) picks.push(0)

    const remaining = letters.map((_, i) => i).filter((i) => !picks.includes(i))
    while (picks.length < revealBudget && remaining.length) {
      const idx = Math.floor(Math.random() * remaining.length)
      picks.push(remaining.splice(idx, 1)[0])
    }

    picks.forEach((i) => {
      blanks[i] = { ...blanks[i], revealed: true }
    })
  }

  return blanks
}

export function isCorrectGuess(blanks, guesses) {
  return blanks.every((b, i) => b.revealed || (guesses[i] || '').toLowerCase() === b.char.toLowerCase())
}
