import { useMemo } from 'react'
import { SECTION_BY_ID } from '../data/items'
import { dateKey } from '../lib/date'
import { useApp } from '../context/AppContext'

export default function ItemGrid({ item, weeks }) {
  const { checkins } = useApp()
  const section = SECTION_BY_ID[item.section]

  const filledCount = useMemo(() => {
    let count = 0
    weeks.forEach((week) =>
      week.forEach(({ date, future }) => {
        if (future) return
        if (checkins[dateKey(date)]?.[item.id]) count += 1
      }),
    )
    return count
  }, [weeks, checkins, item.id])

  const Icon = item.icon

  return (
    <div className="item-grid-block">
      <div className="item-grid-header">
        <div className="icon-badge icon-badge-xs" style={{ '--section-color': section.color }}>
          <Icon size={14} strokeWidth={2.25} />
        </div>
        <span className="item-grid-name">{item.name}</span>
      </div>
      <div className="item-grid" style={{ '--section-color': section.color }}>
        {weeks.map((week, wi) => (
          <div className="item-grid-col" key={wi}>
            {week.map(({ date, future }) => {
              if (future) {
                return <div className="grid-cell cell-future" key={dateKey(date)} />
              }
              const filled = Boolean(checkins[dateKey(date)]?.[item.id])
              return (
                <div
                  key={dateKey(date)}
                  className={`grid-cell${filled ? ' cell-filled' : ''}`}
                  title={dateKey(date)}
                />
              )
            })}
          </div>
        ))}
      </div>
      {filledCount === 0 && (
        <p className="item-grid-note">Room for attention here.</p>
      )}
    </div>
  )
}
