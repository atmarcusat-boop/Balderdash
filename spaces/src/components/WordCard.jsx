import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate as animateValue } from 'framer-motion'
import { BookMarked } from 'lucide-react'
import { isCorrectGuess } from '../lib/blanks'

const SWIPE_THRESHOLD = 110
const VELOCITY_THRESHOLD = 500
const PALETTE = ['#6fa3b8', '#c99a5b', '#b98a9a', '#8fae7c']

const cardVariants = {
  enter: { scale: 0.94, opacity: 0, y: 14 },
  center: { scale: 1, opacity: 1, y: 0 },
  exitSkip: { x: -500, rotate: -18, opacity: 0, transition: { duration: 0.32, ease: 'easeIn' } },
  exitCorrect: { x: 500, rotate: 18, opacity: 0, transition: { duration: 0.36, ease: 'easeIn' } },
}

function blankExample(example, word) {
  const re = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  return example.replace(re, '_____')
}

function colorFor(word) {
  return PALETTE[word.charCodeAt(0) % PALETTE.length]
}

const WordCard = forwardRef(function WordCard({ item, onSkip, onCorrect }, ref) {
  const [guesses, setGuesses] = useState(() => Array(item.blanks.length).fill(''))
  const [status, setStatus] = useState('idle') // idle | correct | wrong
  const [exiting, setExiting] = useState(null) // null | 'skip' | 'correct'
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const inputRefs = useRef({})
  const color = colorFor(item.word)

  const rotate = useTransform(x, [-220, 220], [-14, 14])
  const skipOpacity = useTransform(x, [-100, -10], [1, 0])
  const checkOpacity = useTransform(x, [10, 100], [0, 1])

  const hiddenIndices = item.blanks
    .map((b, i) => (b.revealed ? null : i))
    .filter((i) => i !== null)

  // Focus the first blank as soon as a new card is up. A couple of
  // rAF-staggered retries because on some browsers a focus() call fired
  // in the same tick the card mounts doesn't "stick" until after the
  // first paint.
  useEffect(() => {
    const first = hiddenIndices[0]
    if (first === undefined) return undefined
    let raf2
    const tryFocus = () => {
      const el = inputRefs.current[first]
      if (el && document.activeElement !== el) el.focus()
    }
    tryFocus()
    const raf1 = requestAnimationFrame(() => {
      tryFocus()
      raf2 = requestAnimationFrame(tryFocus)
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.word])

  function focusIndex(i) {
    inputRefs.current[i]?.focus()
  }

  function handleChange(i, raw) {
    const char = raw.replace(/[^a-zA-Z]/g, '').slice(-1)
    setGuesses((prev) => {
      const next = [...prev]
      next[i] = char
      return next
    })
    if (char) {
      const pos = hiddenIndices.indexOf(i)
      const nextIndex = hiddenIndices[pos + 1]
      if (nextIndex !== undefined) focusIndex(nextIndex)
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !guesses[i]) {
      const pos = hiddenIndices.indexOf(i)
      const prevIndex = hiddenIndices[pos - 1]
      if (prevIndex !== undefined) {
        setGuesses((prev) => {
          const next = [...prev]
          next[prevIndex] = ''
          return next
        })
        focusIndex(prevIndex)
      }
    } else if (e.key === 'Enter') {
      attemptSubmit()
    }
  }

  function attemptSubmit() {
    if (status !== 'idle') return
    if (isCorrectGuess(item.blanks, guesses)) {
      setStatus('correct')
      animateValue(x, 0, { type: 'spring', stiffness: 400, damping: 32 })
      animateValue(y, 0, { type: 'spring', stiffness: 400, damping: 32 })
      setTimeout(() => setExiting('correct'), 250)
      setTimeout(() => onCorrect(), 650)
    } else {
      setStatus('wrong')
      animateValue(x, [0, -14, 14, -14, 14, 0], { duration: 0.42, ease: 'easeInOut' })
      animateValue(y, 0, { type: 'spring', stiffness: 400, damping: 32 })
      setTimeout(() => {
        setStatus('idle')
        setGuesses(Array(item.blanks.length).fill(''))
        focusIndex(hiddenIndices[0])
      }, 450)
    }
  }

  function attemptSkip() {
    if (status !== 'idle') return
    setExiting('skip')
    setTimeout(() => onSkip(), 320)
  }

  useImperativeHandle(ref, () => ({ submit: attemptSubmit, skip: attemptSkip }))

  function handleDragEnd(_, info) {
    const { x: dx } = info.offset
    const passedDistance = Math.abs(dx) > SWIPE_THRESHOLD
    const passedVelocity = Math.abs(info.velocity.x) > VELOCITY_THRESHOLD
    if (dx < 0 && (passedDistance || passedVelocity)) {
      attemptSkip()
    } else if (dx > 0 && (passedDistance || passedVelocity)) {
      attemptSubmit()
    } else {
      animateValue(x, 0, { type: 'spring', stiffness: 400, damping: 32 })
      animateValue(y, 0, { type: 'spring', stiffness: 400, damping: 32 })
    }
  }

  return (
    <motion.div
      className={`word-card${status === 'wrong' ? ' word-card-wrong' : ''}${status === 'correct' ? ' word-card-correct' : ''}`}
      style={{ x, y, rotate, '--section-color': color }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      variants={cardVariants}
      initial="enter"
      animate={exiting === 'skip' ? 'exitSkip' : exiting === 'correct' ? 'exitCorrect' : 'center'}
      transition={{ duration: 0.24, ease: 'easeOut' }}
    >
      <motion.div className="stamp stamp-skip" style={{ opacity: skipOpacity }}>
        skip
      </motion.div>
      <motion.div className="stamp stamp-check" style={{ opacity: checkOpacity }}>
        check
      </motion.div>

      <div className="word-card-face">
        <span className="section-tag">{item.word.length} LETTERS</span>
        <div className="icon-badge icon-badge-lg">
          <BookMarked size={26} strokeWidth={2} />
        </div>

        <div className="word-puzzle" onClick={(e) => e.stopPropagation()}>
          {item.blanks.map((b, i) =>
            b.revealed ? (
              <span className="word-letter word-letter-fixed" key={i}>
                {b.char}
              </span>
            ) : (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el
                }}
                className="word-letter word-letter-input"
                value={guesses[i] || ''}
                maxLength={1}
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                disabled={status !== 'idle'}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPointerDown={(e) => e.stopPropagation()}
              />
            ),
          )}
        </div>

        <p className="word-definition">{item.definition}</p>
        <p className="word-example">{blankExample(item.example, item.word)}</p>

        <span className="flip-hint">swipe right to check &middot; swipe left to skip</span>
      </div>
    </motion.div>
  )
})

export default WordCard
