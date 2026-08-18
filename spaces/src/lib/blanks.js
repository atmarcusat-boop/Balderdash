// Turns a word into a reveal/hide pattern for the puzzle card. The first
// letter always shows (so the player has an anchor), and roughly half of
// the rest are blanked out. The starting parity is randomized so the same
// word doesn't always blank the same letters twice in a row.

export function buildBlanks(word) {
  const letters = word.split('')
  const offset = Math.random() < 0.5 ? 0 : 1

  return letters.map((char, i) => {
    if (i === 0) return { char, revealed: true }
    if (i === letters.length - 1 && letters.length > 3) {
      // Keep the last letter blank on longer words so the ending isn't free.
      return { char, revealed: false }
    }
    return { char, revealed: i % 2 === offset }
  })
}

export function isCorrectGuess(blanks, guesses) {
  return blanks.every((b, i) => b.revealed || (guesses[i] || '').toLowerCase() === b.char.toLowerCase())
}
