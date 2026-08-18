// Built-in word bank, used whenever no LLM key is configured (or a live
// generation call fails) so the game always has something to play. Each
// entry's `example` is a normal sentence containing the word — it gets
// blanked out at render time, never stored pre-redacted.

export const WORDS = [
  { word: 'practice', definition: 'Repeated exercise to improve a skill.', example: 'She stayed late for extra practice before the recital.' },
  { word: 'horizon', definition: 'The line where the earth meets the sky.', example: 'The ship disappeared over the horizon.' },
  { word: 'curious', definition: 'Eager to know or learn something.', example: 'The curious cat kept sniffing at the open drawer.' },
  { word: 'gravity', definition: 'The force that pulls objects toward each other.', example: 'Gravity is what keeps the moon in orbit.' },
  { word: 'whisper', definition: 'To speak very softly.', example: 'She had to whisper so she wouldn’t wake the baby.' },
  { word: 'harvest', definition: 'The gathering of crops when they are ripe.', example: 'The whole town helped with the harvest that autumn.' },
  { word: 'journey', definition: 'A long trip from one place to another.', example: 'Their journey across the desert took three weeks.' },
  { word: 'shelter', definition: 'A place giving protection from weather or danger.', example: 'They built a shelter out of branches and leaves.' },
  { word: 'flicker', definition: 'To shine unsteadily, as a flame does.', example: 'The candle began to flicker in the draft.' },
  { word: 'gentle', definition: 'Mild and kind in manner.', example: 'He had a gentle way of calming nervous animals.' },
  { word: 'thunder', definition: 'The loud noise that follows lightning.', example: 'A roll of thunder shook the windows.' },
  { word: 'blanket', definition: 'A large piece of soft fabric used for warmth.', example: 'She pulled the blanket up to her chin.' },
  { word: 'mystery', definition: 'Something that is difficult to explain or understand.', example: 'The disappearance remained a mystery for years.' },
  { word: 'balance', definition: 'A state of even distribution or stability.', example: 'It took her a while to find her balance on the beam.' },
  { word: 'wander', definition: 'To walk without a fixed destination.', example: 'They liked to wander the old streets at dusk.' },
  { word: 'crimson', definition: 'A rich, deep red color.', example: 'The leaves turned crimson by mid-October.' },
  { word: 'orchard', definition: 'A piece of land planted with fruit trees.', example: 'We picked apples in the orchard behind the farmhouse.' },
  { word: 'silence', definition: 'Complete absence of sound.', example: 'A heavy silence fell over the room.' },
  { word: 'triumph', definition: 'A great victory or achievement.', example: 'Winning the championship was a personal triumph.' },
  { word: 'glacier', definition: 'A slow-moving mass of ice.', example: 'The glacier had retreated visibly over the decade.' },
  { word: 'echo', definition: 'A sound reflected off a surface, heard again.', example: 'Her voice echoed through the empty hall.' },
  { word: 'lantern', definition: 'A portable light in a protective case.', example: 'He hung a lantern outside the cabin door.' },
  { word: 'stubborn', definition: 'Refusing to change one’s mind or approach.', example: 'The stubborn stain wouldn’t come out no matter what.' },
  { word: 'canyon', definition: 'A deep gorge, typically with a river through it.', example: 'They hiked to the bottom of the canyon at sunrise.' },
]
