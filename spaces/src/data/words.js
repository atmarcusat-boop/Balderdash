// Built-in word bank, used whenever no LLM key is configured (or a live
// generation call fails) so the game always has something to play. Each
// entry's `example` is a normal sentence containing the word — it gets
// blanked out at render time, never stored pre-redacted.
//
// `tier` is a rough difficulty band (1 = easy/common, 3 = hard/obscure)
// used to pick harder words as a round progresses. It's not scientific —
// just short-and-common vs. long-and-unusual.

export const WORDS = [
  // tier 1 — easy
  { word: 'echo', tier: 1, definition: 'A sound reflected off a surface, heard again.', example: 'Her voice echoed through the empty hall.' },
  { word: 'gentle', tier: 1, definition: 'Mild and kind in manner.', example: 'He had a gentle way of calming nervous animals.' },
  { word: 'wander', tier: 1, definition: 'To walk without a fixed destination.', example: 'They liked to wander the old streets at dusk.' },
  { word: 'canyon', tier: 1, definition: 'A deep gorge, typically with a river through it.', example: 'They hiked to the bottom of the canyon at sunrise.' },
  { word: 'whisper', tier: 1, definition: 'To speak very softly.', example: 'She had to whisper so she wouldn’t wake the baby.' },
  { word: 'thunder', tier: 1, definition: 'The loud noise that follows lightning.', example: 'A roll of thunder shook the windows.' },
  { word: 'blanket', tier: 1, definition: 'A large piece of soft fabric used for warmth.', example: 'She pulled the blanket up to her chin.' },
  { word: 'practice', tier: 1, definition: 'Repeated exercise to improve a skill.', example: 'She stayed late for extra practice before the recital.' },

  // tier 2 — medium
  { word: 'horizon', tier: 2, definition: 'The line where the earth meets the sky.', example: 'The ship disappeared over the horizon.' },
  { word: 'curious', tier: 2, definition: 'Eager to know or learn something.', example: 'The curious cat kept sniffing at the open drawer.' },
  { word: 'harvest', tier: 2, definition: 'The gathering of crops when they are ripe.', example: 'The whole town helped with the harvest that autumn.' },
  { word: 'mystery', tier: 2, definition: 'Something that is difficult to explain or understand.', example: 'The disappearance remained a mystery for years.' },
  { word: 'balance', tier: 2, definition: 'A state of even distribution or stability.', example: 'It took her a while to find her balance on the beam.' },
  { word: 'crimson', tier: 2, definition: 'A rich, deep red color.', example: 'The leaves turned crimson by mid-October.' },
  { word: 'stubborn', tier: 2, definition: 'Refusing to change one’s mind or approach.', example: 'The stubborn stain wouldn’t come out no matter what.' },
  { word: 'lantern', tier: 2, definition: 'A portable light in a protective case.', example: 'He hung a lantern outside the cabin door.' },

  // tier 3 — hard
  { word: 'ephemeral', tier: 3, definition: 'Lasting for a very short time.', example: 'The beauty of cherry blossoms is famously ephemeral.' },
  { word: 'labyrinth', tier: 3, definition: 'A complicated network of winding passages.', example: 'The old quarter was a labyrinth of narrow alleys.' },
  { word: 'cacophony', tier: 3, definition: 'A harsh mixture of loud, discordant sounds.', example: 'The kitchen dissolved into a cacophony of pans and shouting.' },
  { word: 'serendipity', tier: 3, definition: 'Finding something good without looking for it.', example: 'Meeting her old professor there was pure serendipity.' },
  { word: 'reticent', tier: 3, definition: 'Reluctant to speak about one’s thoughts or feelings.', example: 'He stayed reticent about what happened at the meeting.' },
  { word: 'ubiquitous', tier: 3, definition: 'Found everywhere at once.', example: 'Smartphones have become ubiquitous in daily life.' },
  { word: 'melancholy', tier: 3, definition: 'A deep, thoughtful sadness.', example: 'A melancholy mood settled over the house that winter.' },
  { word: 'gregarious', tier: 3, definition: 'Fond of company; sociable.', example: 'Her gregarious personality made her the life of every party.' },
]
