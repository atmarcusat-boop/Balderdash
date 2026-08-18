import { WORDS } from '../data/words'
import { generateWord } from './llm'

// Tries the LLM first when a key is configured; falls back to the
// built-in list on any failure (bad key, offline, rate limit) so a
// broken connection never blocks the game.
export async function nextWord(apiKey, usedWords = []) {
  if (apiKey) {
    try {
      return await generateWord(apiKey, usedWords)
    } catch (err) {
      console.warn('Spaces: LLM word generation failed, using built-in list instead.', err)
    }
  }
  return pickFallbackWord(usedWords)
}

function pickFallbackWord(usedWords) {
  const unused = WORDS.filter((w) => !usedWords.includes(w.word))
  const pool = unused.length ? unused : WORDS
  return pool[Math.floor(Math.random() * pool.length)]
}
