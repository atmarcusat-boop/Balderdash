import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Layers, ListChecks, RotateCcw } from 'lucide-react'
import { ITEMS, SECTION_BY_ID } from '../data/items'
import { useApp } from '../context/AppContext'
import { todayKey } from '../lib/date'
import { weight } from '../lib/answers'
import SwipeCard from './SwipeCard'
import ChecklistView from './ChecklistView'

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

  const [viewMode, setViewMode] = useState('deck')
  const [exitDirection, setExitDirection] = useState(null)

  const answeredCount = Object.keys(todayEntry).length
  const currentItem = useMemo(
    () => ITEMS.find((item) => todayEntry[item.id] === undefined),
    [todayEntry],
  )
  const done = !currentItem

  const yesCount = useMemo(
    () => Object.values(todayEntry).reduce((sum, value) => sum + weight(value), 0),
    [todayEntry],
  )

  function handleDecide(direction) {
    recordAnswer(currentItem.id, direction)
    setExitDirection(direction)
  }

  function handleReview() {
    clearTodayAnswers(today)
    setViewMode('deck')
  }

  function toggleView() {
    setViewMode((mode) => (mode === 'deck' ? 'list' : 'deck'))
  }

  if (done) {
    return (
      <div className="deck-screen deck-reflection">
        <p className="reflection-eyebrow">Today</p>
        <h1 className="reflection-text">{reflectionFor(yesCount)}</h1>
        <p className="reflection-sub">That's it for today — come back tomorrow.</p>
        <button type="button" className="btn btn-ghost btn-icon tap-target" onClick={handleReview}>
          <RotateCcw size={15} strokeWidth={2.25} />
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
          animate={{ width: `${(answeredCount / ITEMS.length) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      <div className="deck-progress-row">
        <span className="deck-progress">{answeredCount} of {ITEMS.length}</span>
        <button
          type="button"
          className="view-toggle tap-target"
          aria-label={viewMode === 'deck' ? 'Switch to checklist' : 'Switch to cards'}
          onClick={toggleView}
        >
          {viewMode === 'deck' ? (
            <ListChecks size={17} strokeWidth={2.25} />
          ) : (
            <Layers size={17} strokeWidth={2.25} />
          )}
        </button>
      </div>

      {viewMode === 'list' ? (
        <ChecklistView todayEntry={todayEntry} onAnswer={recordAnswer} />
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
