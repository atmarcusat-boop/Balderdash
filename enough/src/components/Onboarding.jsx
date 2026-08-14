import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../context/AppContext'

const SLIDES = [
  {
    text: "Some days are good. Some aren't. Enough helps you notice why.",
  },
  {
    text: "There's endless advice on how to be happy, and it's hard to hear yourself think over it. So we looked at the research and found 12 things that, done most days, tend to make life better.",
  },
  {
    text: 'No streaks. No goals. Nothing to guilt you into opening the app again. Just a simple daily check: did I have a good day? And if so, why? If not, why?',
  },
  {
    text: 'Free forever. Give it a go.',
    cta: true,
  },
]

const SWIPE_THRESHOLD = 60

export default function Onboarding() {
  const { completeOnboarding } = useApp()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const isLast = index === SLIDES.length - 1

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
            <p className="onboarding-text">{SLIDES[index].text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="onboarding-footer">
        <div className="onboarding-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`onboarding-dot tap-target${i === index ? ' active' : ''}`}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {isLast ? (
          <button type="button" className="btn btn-primary" onClick={completeOnboarding}>
            Get started
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
