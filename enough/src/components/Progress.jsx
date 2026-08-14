import { useMemo } from 'react'
import { ITEMS, SECTIONS } from '../data/items'
import { buildWeeks, monthLabelsForWeeks } from '../lib/grid'
import ItemGrid from './ItemGrid'

const DAYS = 90

export default function Progress() {
  const weeks = useMemo(() => buildWeeks(DAYS), [])
  const monthLabels = useMemo(() => monthLabelsForWeeks(weeks), [weeks])

  return (
    <div className="progress-screen">
      <div className="progress-header">
        <h1>Progress</h1>
        <p className="progress-sub">The last three months, at a glance.</p>
      </div>

      <div className="month-labels">
        {monthLabels.map((label, i) => (
          <span className="month-label" key={i}>
            {label}
          </span>
        ))}
      </div>

      {SECTIONS.map((section) => (
        <div className="progress-section" key={section.id}>
          <h2 className="progress-section-title" style={{ color: section.color }}>
            {section.name}
          </h2>
          {ITEMS.filter((item) => item.section === section.id).map((item) => (
            <ItemGrid key={item.id} item={item} weeks={weeks} />
          ))}
        </div>
      ))}
    </div>
  )
}
