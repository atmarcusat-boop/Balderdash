import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ITEMS, SECTIONS } from '../data/items'
import { buildMonths } from '../lib/grid'
import ItemGrid from './ItemGrid'
import ItemCalendarSheet from './ItemCalendarSheet'
import InsightsCard from './InsightsCard'

const MONTHS_BACK = 3

export default function Progress() {
  const months = useMemo(() => buildMonths(MONTHS_BACK), [])
  const [expandedItem, setExpandedItem] = useState(null)

  return (
    <div className="progress-screen">
      <div className="progress-header">
        <h1>Progress</h1>
        <p className="progress-sub">The last three months, at a glance.</p>
      </div>

      <InsightsCard />

      {SECTIONS.map((section) => (
        <div className="progress-section" key={section.id}>
          <h2 className="progress-section-title" style={{ color: section.color }}>
            {section.name}
          </h2>
          {ITEMS.filter((item) => item.section === section.id).map((item) => (
            <ItemGrid key={item.id} item={item} months={months} onExpand={setExpandedItem} />
          ))}
        </div>
      ))}

      <AnimatePresence>
        {expandedItem && (
          <ItemCalendarSheet item={expandedItem} onClose={() => setExpandedItem(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
