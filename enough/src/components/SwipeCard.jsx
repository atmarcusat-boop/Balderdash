import { useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate as animateValue } from 'framer-motion'
import { SECTION_BY_ID } from '../data/items'

function IconBadge({ Icon, color, size = 'lg' }) {
  return (
    <div className={`icon-badge icon-badge-${size}`} style={{ '--section-color': color }}>
      <Icon size={size === 'lg' ? 28 : 18} strokeWidth={2} />
    </div>
  )
}

function faceStyle(color, image) {
  const style = { '--section-color': color }
  if (image) {
    style.backgroundImage = `linear-gradient(180deg, rgba(10, 11, 15, 0.5), rgba(10, 11, 15, 0.72)), url(${image})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
  }
  return style
}

const SWIPE_THRESHOLD = 110
const VELOCITY_THRESHOLD = 500

const cardVariants = {
  enter: { scale: 0.94, opacity: 0, y: 14 },
  center: { scale: 1, opacity: 1, y: 0 },
  exit: (dir) => ({
    x: dir === 'yes' ? 500 : dir === 'no' ? -500 : 0,
    y: dir === 'partial' ? 500 : 0,
    rotate: dir === 'yes' ? 18 : dir === 'no' ? -18 : 0,
    opacity: 0,
    transition: { duration: 0.32, ease: 'easeIn' },
  }),
}

export default function SwipeCard({ item, onDecide, interactive = true }) {
  const [flipped, setFlipped] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const wasDragged = useRef(false)
  const section = SECTION_BY_ID[item.section]

  const rotate = useTransform(x, [-220, 220], [-14, 14])
  const yesOpacity = useTransform(x, [10, 100], [0, 1])
  const noOpacity = useTransform(x, [-100, -10], [1, 0])
  const partialOpacity = useTransform(y, [10, 100], [0, 1])

  function handleDragEnd(_, info) {
    const { x: dx, y: dy } = info.offset
    const verticalWins = Math.abs(dy) > Math.abs(dx)
    const passedDistance = verticalWins ? dy > SWIPE_THRESHOLD : Math.abs(dx) > SWIPE_THRESHOLD
    const passedVelocity = verticalWins
      ? info.velocity.y > VELOCITY_THRESHOLD
      : Math.abs(info.velocity.x) > VELOCITY_THRESHOLD

    if (verticalWins && dy > 0 && (passedDistance || passedVelocity)) {
      onDecide('partial')
    } else if (!verticalWins && (passedDistance || passedVelocity)) {
      onDecide(dx > 0 ? 'yes' : 'no')
    } else {
      animateValue(x, 0, { type: 'spring', stiffness: 400, damping: 32 })
      animateValue(y, 0, { type: 'spring', stiffness: 400, damping: 32 })
    }
    setTimeout(() => {
      wasDragged.current = false
    }, 0)
  }

  function handleClick() {
    if (Math.abs(x.get()) > 5 || Math.abs(y.get()) > 5) {
      wasDragged.current = true
      return
    }
    setFlipped((f) => !f)
  }

  return (
    <motion.div
      className="swipe-card"
      style={interactive ? { x, y, rotate } : undefined}
      drag={interactive}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
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
          <motion.div className="stamp stamp-partial" style={{ opacity: partialOpacity }}>
            partial
          </motion.div>
        </>
      )}

      <div className={`swipe-card-inner${flipped ? ' flipped' : ''}`}>
        <div className="swipe-card-face swipe-card-front" style={faceStyle(section.color, item.image)}>
          <span className="section-tag">{section.name}</span>
          <IconBadge Icon={item.icon} color={section.color} />
          <h2 className="item-name">{item.name}</h2>
          <p className="item-question">{item.front}</p>
          {item.example && <p className="item-example">{item.example}</p>}
          <span className="flip-hint">tap to read more</span>
        </div>

        <div className="swipe-card-face swipe-card-back" style={faceStyle(section.color, item.image)}>
          <span className="section-tag">{section.name}</span>
          <IconBadge Icon={item.icon} color={section.color} size="sm" />
          <h3 className="item-name item-name-small">{item.name}</h3>
          <p className="item-description">{item.back}</p>
          <span className="flip-hint">tap to flip back</span>
        </div>
      </div>
    </motion.div>
  )
}
