import { WORDS } from '../data/words'
import { generateWord } from './llm'

// Tries the LLM first when a key is configured; falls back to the
// built-in list on any failure (bad key, offline, rate limit) so a
// broken connection never blocks the game. `difficulty` (0 easy..1 hard)
// steers word choice on both paths.
export async function nextWord(apiKey, usedWords = [], difficulty = 0) {
  if (apiKey) {
    try {
      return await generateWord(apiKey, usedWords, difficulty)
    } catch (err) {
      console.warn('Spaces: LLM word generation failed, using built-in list instead.', err)
    }
  }
  return pickFallbackWord(usedWords, difficulty)
}

function tierFor(difficulty) {
  if (difficulty < 0.34) return 1
  if (difficulty < 0.67) return 2
  return 3
}

function pickFallbackWord(usedWords, difficulty) {
  const tier = tierFor(difficulty)
  const unused = WORDS.filter((w) => !usedWords.includes(w.word))
  const tierPool = unused.filter((w) => w.tier === tier)
  const pool = tierPool.length ? tierPool : unused.length ? unused : WORDS
  return pool[Math.floor(Math.random() * pool.length)]
}
