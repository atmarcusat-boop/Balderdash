// Turns a word into a reveal/hide pattern for the puzzle card. `difficulty`
// is 0 (first word, easy) to 1 (final word, hard): easy words start with
// most letters shown and the first letter guaranteed; hard words show very
// few letters and the first letter is no longer a given. Reveal decisions
// are randomized per letter (not a fixed alternating pattern) so the same
// word doesn't look identical twice, and at least one letter always stays
// hidden.

const EASY_REVEAL_FRACTION = 0.75
const HARD_REVEAL_FRACTION = 0.2
const EASY_FIRST_LETTER_CHANCE = 1
const HARD_FIRST_LETTER_CHANCE = 0.25

function lerp(a, b, t) {
  return a + (b - a) * t
}

export function buildBlanks(word, difficulty = 0) {
  const t = Math.min(1, Math.max(0, difficulty))
  const revealFraction = lerp(EASY_REVEAL_FRACTION, HARD_REVEAL_FRACTION, t)
  const firstLetterChance = lerp(EASY_FIRST_LETTER_CHANCE, HARD_FIRST_LETTER_CHANCE, t)

  const letters = word.split('')
  const blanks = letters.map((char, i) => {
    if (i === 0) return { char, revealed: Math.random() < firstLetterChance }
    return { char, revealed: Math.random() < revealFraction }
  })

  if (blanks.every((b) => b.revealed)) {
    // Prefer hiding a letter after the first — keeps the "first letter is
    // an easy-mode anchor" intent intact even when every roll came up
    // revealed and the safety net has to blank something.
    const candidates = blanks.length > 1 ? blanks.slice(1) : blanks
    const offset = blanks.length > 1 ? 1 : 0
    const forceHide = offset + Math.floor(Math.random() * candidates.length)
    blanks[forceHide] = { ...blanks[forceHide], revealed: false }
  }

  return blanks
}

export function isCorrectGuess(blanks, guesses) {
  return blanks.every((b, i) => b.revealed || (guesses[i] || '').toLowerCase() === b.char.toLowerCase())
}
