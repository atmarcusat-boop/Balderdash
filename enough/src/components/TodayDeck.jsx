import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ITEMS, SECTION_BY_ID } from '../data/items'
import { useApp } from '../context/AppContext'
import { todayKey } from '../lib/date'
import { weight } from '../lib/answers'
import SwipeCard from './SwipeCard'

function reflectionFor(count) {
  if (count >= 11) return 'A full day.'
  if (count >= 8) return 'A really good day.'
  if (count >= 5) return 'A fair day, and that’s alright.'
  if (count >= 2) return 'A quieter day, and that’s fine.'
  return 'A hard one. Tomorrow is a new day.'
}

export default function TodayDeck() {
  const { checkins, recordAnswer, clearTodayAnswers } = useApp()
  const today = todayKey()
  const todayEntry = checkins[today] || {}

  const answeredCount = Object.keys(todayEntry).length
  const initialIndex = Math.min(answeredCount, ITEMS.length)
  const [index, setIndex] = useState(initialIndex)

  const [exitDirection, setExitDirection] = useState(null)

  const currentItem = ITEMS[index]
  const done = index >= ITEMS.length

  const yesCount = useMemo(
    () => Object.values(todayEntry).reduce((sum, value) => sum + weight(value), 0),
    [todayEntry],
  )

  function handleDecide(direction) {
    recordAnswer(currentItem.id, direction)
    setExitDirection(direction)
    setIndex((i) => i + 1)
  }

  function handleReview() {
    clearTodayAnswers(today)
    setIndex(0)
  }

  if (done) {
    return (
      <div className="deck-screen deck-reflection">
        <p className="reflection-eyebrow">Today</p>
        <h1 className="reflection-text">{reflectionFor(yesCount)}</h1>
        <p className="reflection-sub">That's it for today — come back tomorrow.</p>
        <button type="button" className="btn btn-ghost tap-target" onClick={handleReview}>
          Go through again
        </button>
      </div>
    )
  }

  return (
    <div className="deck-screen">
      <div className="deck-progress-track">
        <motion.div
          className="deck-progress-fill"
          animate={{ width: `${(index / ITEMS.length) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="deck-progress">
        <span>{index + 1} of {ITEMS.length}</span>
      </div>

      <div className="deck-stack">
        <div
          className="deck-glow"
          style={{ background: SECTION_BY_ID[currentItem.section].color }}
        />
        <AnimatePresence custom={exitDirection}>
          <SwipeCard key={currentItem.id} item={currentItem} onDecide={handleDecide} />
        </AnimatePresence>
      </div>

      <div className="deck-buttons">
        <button
          type="button"
          className="deck-btn deck-btn-no tap-target"
          aria-label="Not today"
          onClick={() => handleDecide('no')}
        >
          ✕
        </button>
        <button
          type="button"
          className="deck-btn deck-btn-partial tap-target"
          aria-label="Partway there"
          onClick={() => handleDecide('partial')}
        >
          –
        </button>
        <button
          type="button"
          className="deck-btn deck-btn-yes tap-target"
          aria-label="Did this today"
          onClick={() => handleDecide('yes')}
        >
          ✓
        </button>
      </div>
    </div>
  )
}
