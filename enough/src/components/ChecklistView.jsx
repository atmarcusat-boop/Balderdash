import { ITEMS, SECTION_BY_ID } from '../data/items'
import { isFilled, isPartial } from '../lib/answers'

export default function ChecklistView({ todayEntry, onAnswer }) {
  return (
    <div className="checklist">
      {ITEMS.map((item) => {
        const section = SECTION_BY_ID[item.section]
        const value = todayEntry[item.id]
        const Icon = item.icon
        return (
          <div className="checklist-row" key={item.id}>
            <div className="checklist-row-info">
              <div
                className="icon-badge icon-badge-xs"
                style={{ '--section-color': section.color }}
              >
                <Icon size={15} strokeWidth={2.25} />
              </div>
              <span className="checklist-name">{item.name}</span>
            </div>
            <div className="checklist-row-actions">
              <button
                type="button"
                className={`checklist-btn checklist-btn-no${value === 'no' ? ' active' : ''}`}
                aria-label={`${item.name}: not today`}
                onClick={() => onAnswer(item.id, 'no')}
              >
                ✕
              </button>
              <button
                type="button"
                className={`checklist-btn checklist-btn-partial${isPartial(value) ? ' active' : ''}`}
                aria-label={`${item.name}: partway there`}
                onClick={() => onAnswer(item.id, 'partial')}
              >
                –
              </button>
              <button
                type="button"
                className={`checklist-btn checklist-btn-yes${isFilled(value) ? ' active' : ''}`}
                aria-label={`${item.name}: did this today`}
                onClick={() => onAnswer(item.id, 'yes')}
              >
                ✓
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
