// Direct browser calls to the Anthropic API to generate fresh words on the
// fly. This is a "bring your own key" setup — there's no backend to proxy
// through, so the key lives in this browser only (see settingsStorage.js)
// and is sent straight to Anthropic with the direct-browser-access opt-in
// header. Anyone with dev tools open on this device could read the key
// back out of it, same tradeoff as any client-only app with a user key.

const MODEL = 'claude-haiku-4-5-20251001'

const TOOL = {
  name: 'submit_word',
  description: 'Submit one vocabulary word for a word-guessing game.',
  input_schema: {
    type: 'object',
    properties: {
      word: {
        type: 'string',
        description: 'A single English word matching the requested difficulty, lowercase, no spaces or hyphens.',
      },
      definition: {
        type: 'string',
        description: 'A short, clear definition of the word (under 12 words). Must not contain the word itself.',
      },
      example: {
        type: 'string',
        description: 'One natural sentence using the word. Must contain the exact word.',
      },
    },
    required: ['word', 'definition', 'example'],
  },
}

function difficultyBrief(difficulty) {
  if (difficulty < 0.34) {
    return 'Difficulty: EASY. Pick a short, extremely common everyday word (4-6 letters) most adults would know instantly.'
  }
  if (difficulty < 0.67) {
    return 'Difficulty: MEDIUM. Pick a common but slightly less everyday word (6-9 letters) — not obscure, but not trivial either.'
  }
  return 'Difficulty: HARD. Pick a genuinely challenging, less common word (9+ letters) — the kind a strong reader would have to think about, not something in casual daily use.'
}

export async function generateWord(apiKey, usedWords = [], difficulty = 0) {
  const avoid = usedWords.length
    ? ` Avoid these words already used this game: ${usedWords.join(', ')}.`
    : ''

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Pick one English word for a word-guessing game (like a spelling/vocabulary game for adults). ${difficultyBrief(difficulty)}${avoid}`,
        },
      ],
      tools: [TOOL],
      tool_choice: { type: 'tool', name: 'submit_word' },
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Anthropic API error ${res.status}: ${body.slice(0, 200)}`)
  }

  const data = await res.json()
  const toolUse = data.content?.find((block) => block.type === 'tool_use')
  if (!toolUse) throw new Error('No word returned')

  const { word, definition, example } = toolUse.input
  if (!word || !definition || !example) throw new Error('Incomplete word returned')

  return {
    word: word.trim().toLowerCase(),
    definition: definition.trim(),
    example: example.trim(),
  }
}
