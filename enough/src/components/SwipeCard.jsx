import { useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate as animateValue } from 'framer-motion'
import { SECTION_BY_ID } from '../data/items'

const SWIPE_THRESHOLD = 110
const VELOCITY_THRESHOLD = 500

const cardVariants = {
  enter: { scale: 0.94, opacity: 0, y: 14 },
  center: { scale: 1, opacity: 1, y: 0 },
  exit: (dir) => ({
    x: dir === 'yes' ? 500 : dir === 'no' ? -500 : 0,
    rotate: dir === 'yes' ? 18 : dir === 'no' ? -18 : 0,
    opacity: 0,
    transition: { duration: 0.32, ease: 'easeIn' },
  }),
}

export default function SwipeCard({ item, onDecide, interactive = true }) {
  const [flipped, setFlipped] = useState(false)
  const x = useMotionValue(0)
  const wasDragged = useRef(false)
  const section = SECTION_BY_ID[item.section]

  const rotate = useTransform(x, [-220, 220], [-14, 14])
  const yesOpacity = useTransform(x, [10, 100], [0, 1])
  const noOpacity = useTransform(x, [-100, -10], [1, 0])

  function handleDragEnd(_, info) {
    const passedDistance = Math.abs(info.offset.x) > SWIPE_THRESHOLD
    const passedVelocity = Math.abs(info.velocity.x) > VELOCITY_THRESHOLD
    if (passedDistance || passedVelocity) {
      onDecide(info.offset.x > 0 ? 'yes' : 'no')
    } else {
      animateValue(x, 0, { type: 'spring', stiffness: 400, damping: 32 })
    }
    setTimeout(() => {
      wasDragged.current = false
    }, 0)
  }

  function handleClick() {
    if (Math.abs(x.get()) > 5) {
      wasDragged.current = true
      return
    }
    setFlipped((f) => !f)
  }

  return (
    <motion.div
      className="swipe-card"
      style={interactive ? { x, rotate } : undefined}
      drag={interactive ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={interactive ? handleDragEnd : undefined}
      onClick={interactive ? handleClick : undefined}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      {interactive && (
        <>
          <motion.div className="stamp stamp-yes" style={{ opacity: yesOpacity }}>
            today
          </motion.div>
          <motion.div className="stamp stamp-no" style={{ opacity: noOpacity }}>
            not today
          </motion.div>
        </>
      )}

      <div className={`swipe-card-inner${flipped ? ' flipped' : ''}`}>
        <div
          className="swipe-card-face swipe-card-front"
          style={{ '--section-color': section.color }}
        >
          <span className="section-tag">{section.name}</span>
          <h2 className="item-name">{item.name}</h2>
          <p className="item-question">{item.front}</p>
          <span className="flip-hint">tap to read more</span>
        </div>

        <div
          className="swipe-card-face swipe-card-back"
          style={{ '--section-color': section.color }}
        >
          <span className="section-tag">{section.name}</span>
          <h3 className="item-name item-name-small">{item.name}</h3>
          <p className="item-description">{item.back}</p>
          <span className="flip-hint">tap to flip back</span>
        </div>
      </div>
    </motion.div>
  )
}
