import { useMemo } from 'react'
import { SECTION_BY_ID } from '../data/items'
import { buildInsights } from '../lib/insights'
import { useApp } from '../context/AppContext'

const COPY = {
  good: (name) => `${name} has been one of your steadiest lately.`,
  attention: (name) => `${name} has had a quieter stretch — might be worth some room this week.`,
  'trend-up': (name) => `${name} has been picking up over the last couple of weeks.`,
  'trend-down': (name) => `${name} has quietly slipped the last couple of weeks.`,
}

export default function InsightsCard() {
  const { checkins } = useApp()
  const insights = useMemo(() => buildInsights(checkins), [checkins])

  return (
    <div className="insights-card">
      <p className="insights-eyebrow">Last 30 days</p>

      {insights.ready ? (
        <div className="insights-lines">
          {insights.lines.map(({ type, item }) => {
            const section = SECTION_BY_ID[item.section]
            const Icon = item.icon
            return (
              <div className="insight-line" key={item.id}>
                <div
                  className="icon-badge icon-badge-xs"
                  style={{ '--section-color': section.color }}
                >
                  <Icon size={14} strokeWidth={2.25} />
                </div>
                <p>{COPY[type](item.name)}</p>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="insights-empty">Check in a bit more and patterns will start to show up here.</p>
      )}
    </div>
  )
}
