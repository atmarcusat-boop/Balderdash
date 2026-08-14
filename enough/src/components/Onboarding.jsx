import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CloudSun, Compass, Leaf, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { SECTIONS } from '../data/items'

const SLIDES = [
  {
    icon: CloudSun,
    color: SECTIONS[0].color,
    text: "Some days are good. Some aren't. Enough helps you notice why.",
  },
  {
    icon: Compass,
    color: SECTIONS[1].color,
    text: "There's endless advice on how to be happy, and it's hard to hear yourself think over it. So we looked at the research and found 12 things that, done most days, tend to make life better.",
  },
  {
    icon: Leaf,
    color: SECTIONS[2].color,
    text: 'No streaks. No goals. Nothing to guilt you into opening the app again. Just a simple daily check: did I have a good day? And if so, why? If not, why?',
  },
  {
    icon: Sparkles,
    color: SECTIONS[3].color,
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
