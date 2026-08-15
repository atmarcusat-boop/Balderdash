import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { buildFullBreakdown } from '../lib/insights'
import { useApp } from '../context/AppContext'

const SECTION_COPY = {
  strong: 'has been solid this month.',
  steady: 'has been fairly steady.',
  attention: 'could use a bit more room.',
  noData: "doesn't have enough check-ins yet to say.",
}

const GROUPS = [
  { tier: 'strong', title: 'Going well' },
  { tier: 'steady', title: 'Steady' },
  { tier: 'attention', title: 'Could use more room' },
  { tier: 'noData', title: 'Not enough data yet' },
]

export default function InsightsDetailSheet({ onClose }) {
  const { checkins } = useApp()
  const breakdown = useMemo(() => buildFullBreakdown(checkins), [checkins])

  return (
    <motion.div
      className="sheet-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="sheet sheet-calendar"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <h2 className="sheet-title">The full picture</h2>
        <p className="sheet-sub">Last 30 days, item by item.</p>

        <div className="sheet-calendar-body">
          <div className="breakdown-sections">
            {breakdown.sections.map(({ section, tier }) => (
              <p className="breakdown-section-line" key={section.id}>
                <span style={{ color: section.color }}>{section.name}</span> {SECTION_COPY[tier]}
              </p>
            ))}
          </div>

          {GROUPS.map(({ tier, title }) =>
            breakdown.tiers[tier].length ? (
              <div className="breakdown-group" key={tier}>
                <p className="breakdown-group-title">{title}</p>
                <div className="breakdown-items">
                  {breakdown.tiers[tier].map((item) => {
                    const Icon = item.icon
                    return (
                      <div className="breakdown-item" key={item.id}>
                        <Icon size={13} strokeWidth={2.25} />
                        <span>{item.name}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null,
          )}
        </div>

        <button type="button" className="btn btn-ghost sheet-close tap-target" onClick={onClose}>
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}
