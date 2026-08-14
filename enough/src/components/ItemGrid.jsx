import { useMemo } from 'react'
import { SECTION_BY_ID } from '../data/items'
import { dateKey } from '../lib/date'
import { useApp } from '../context/AppContext'

const COLUMNS = 31

export default function ItemGrid({ item, months }) {
  const { checkins } = useApp()
  const section = SECTION_BY_ID[item.section]
  const Icon = item.icon

  const filledCount = useMemo(() => {
    let count = 0
    months.forEach((month) =>
      month.days.forEach(({ date, future }) => {
        if (future) return
        if (checkins[dateKey(date)]?.[item.id]) count += 1
      }),
    )
    return count
  }, [months, checkins, item.id])

  return (
    <div className="item-grid-block">
      <div className="item-grid-header">
        <div className="icon-badge icon-badge-xs" style={{ '--section-color': section.color }}>
          <Icon size={14} strokeWidth={2.25} />
        </div>
        <span className="item-grid-name">{item.name}</span>
      </div>

      <div className="item-grid-months" style={{ '--section-color': section.color }}>
        {months.map((month) => (
          <div className="item-grid-month-row" key={month.key}>
            <span className="item-grid-month-label">{month.label}</span>
            <div className="item-grid-days">
              {Array.from({ length: COLUMNS }, (_, i) => {
                const day = month.days[i]
                if (!day) {
                  return <div className="grid-cell cell-pad" key={i} />
                }
                if (day.future) {
                  return <div className="grid-cell cell-future" key={i} />
                }
                const filled = Boolean(checkins[dateKey(day.date)]?.[item.id])
                return (
                  <div
                    key={i}
                    className={`grid-cell${filled ? ' cell-filled' : ''}`}
                    title={dateKey(day.date)}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {filledCount === 0 && <p className="item-grid-note">Room for attention here.</p>}
    </div>
  )
}
