import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Keyboard, Puzzle, Repeat, Timer } from 'lucide-react'
import { useGame } from '../context/GameContext'

// Same four-color palette Enough uses, just no longer tied to "sections" —
// here it's purely a rhythm across the onboarding slides.
const PALETTE = ['#6fa3b8', '#c99a5b', '#b98a9a', '#8fae7c']

const GROUPS = [
  {
    icon: Puzzle,
    color: PALETTE[0],
    sentences: ['Every word is missing a few letters.', 'You fill them in.'],
  },
  {
    icon: Keyboard,
    color: PALETTE[1],
    sentences: [
      'Each card gives you a definition and an example sentence to work from.',
      'Type the blanks, then swipe right to check.',
    ],
  },
  {
    icon: Repeat,
    color: PALETTE[2],
    sentences: ["Get it wrong and the card just shakes — try again.", "Don't know it? Swipe left to skip."],
  },
  {
    icon: Timer,
    color: PALETTE[3],
    sentences: ["You've got 5 minutes.", 'Every correct word buys 30 more seconds.', 'Get 10 right before the clock runs out.'],
  },
]

const SLIDES = GROUPS.flatMap(({ icon, color, sentences }) =>
  sentences.map((text) => ({ icon, color, text })),
)

const SWIPE_THRESHOLD = 60

export default function Onboarding() {
  const { completeOnboarding } = useGame()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const isLast = index === SLIDES.length - 1
  const Icon = SLIDES[index].icon

  function goTo(next) {
    if (next < 0 || next >= SLIDES.length) return
    setDirection(next > index ? 1 : -1)
    setIndex(next)
  }

  function handleDragEnd(_, info) {
    if (info.offset.x < -SWIPE_THRESHOLD) goTo(index + 1)
    else if (info.offset.x > SWIPE_THRESHOLD) goTo(index - 1)
  }

  return (
    <div className="onboarding">
      <div className="onboarding-slide-area">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            className="onboarding-slide"
            custom={direction}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 40 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div className="onboarding-icon-glow" style={{ '--slide-color': SLIDES[index].color }}>
              <div className="onboarding-icon-badge">
                <Icon size={30} strokeWidth={2} />
              </div>
            </div>
            <p className="onboarding-text">{SLIDES[index].text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="onboarding-footer">
        <div className="onboarding-dots">
          {SLIDES.map((slide, i) => (
            <button
              key={i}
              type="button"
              className={`onboarding-dot tap-target${i === index ? ' active' : ''}`}
              style={i === index ? { background: slide.color } : undefined}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {isLast ? (
          <button type="button" className="btn btn-primary" onClick={completeOnboarding}>
            Let's go
          </button>
        ) : (
          <div className="onboarding-actions">
            <button type="button" className="btn btn-ghost tap-target" onClick={completeOnboarding}>
              Skip
            </button>
            <button type="button" className="btn btn-primary" onClick={() => goTo(index + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
