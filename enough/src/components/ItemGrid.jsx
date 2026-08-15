import { CalendarDays } from 'lucide-react'
import { SECTION_BY_ID } from '../data/items'
import { dateKey } from '../lib/date'
import { isFilled, isPartial } from '../lib/answers'
import { useApp } from '../context/AppContext'

export default function ItemGrid({ item, months, onExpand, showHeader = true }) {
  const { checkins } = useApp()
  const section = SECTION_BY_ID[item.section]
  const Icon = item.icon

  return (
    <div className="item-grid-block">
      {showHeader && (
        <div className="item-grid-header">
          <div className="item-grid-header-info">
            <div className="icon-badge icon-badge-xs" style={{ '--section-color': section.color }}>
              <Icon size={14} strokeWidth={2.25} />
            </div>
            <span className="item-grid-name">{item.name}</span>
          </div>
          {onExpand && (
            <button
              type="button"
              className="item-grid-expand tap-target"
              aria-label={`Full calendar for ${item.name}`}
              onClick={() => onExpand(item)}
            >
              <CalendarDays size={15} strokeWidth={2.25} />
            </button>
          )}
        </div>
      )}

      <div className="item-grid-months" style={{ '--section-color': section.color }}>
        {months.map((month) => (
          <div className="item-grid-month-row" key={month.key}>
            <span className="item-grid-month-label">{month.label}</span>
            <div className="item-grid-days">
              {month.days.map((day) => {
                const value = checkins[dateKey(day.date)]?.[item.id]
                const stateClass = isFilled(value)
                  ? ' cell-filled'
                  : isPartial(value)
                    ? ' cell-partial'
                    : ''
                return (
                  <div
                    key={dateKey(day.date)}
                    className={`grid-cell${stateClass}`}
                    title={dateKey(day.date)}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
