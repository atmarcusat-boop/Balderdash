import { useMemo } from 'react'
import { ITEMS, SECTIONS } from '../data/items'
import { buildMonths } from '../lib/grid'
import ItemGrid from './ItemGrid'

const MONTHS_BACK = 3

export default function Progress() {
  const months = useMemo(() => buildMonths(MONTHS_BACK), [])

  return (
    <div className="progress-screen">
      <div className="progress-header">
        <h1>Progress</h1>
        <p className="progress-sub">The last three months, at a glance.</p>
      </div>

      {SECTIONS.map((section) => (
        <div className="progress-section" key={section.id}>
          <h2 className="progress-section-title" style={{ color: section.color }}>
            {section.name}
          </h2>
          {ITEMS.filter((item) => item.section === section.id).map((item) => (
            <ItemGrid key={item.id} item={item} months={months} />
          ))}
        </div>
      ))}
    </div>
  )
}
