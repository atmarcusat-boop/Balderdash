import { useMemo, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { SECTION_BY_ID } from '../data/items'
import { buildInsights } from '../lib/insights'
import { useApp } from '../context/AppContext'
import InsightsDetailSheet from './InsightsDetailSheet'

const COPY = {
  good: (name) => `${name} has been one of your steadiest lately.`,
  attention: (name) => `${name} has had a quieter stretch — might be worth some room this week.`,
  'trend-up': (name) => `${name} has been picking up over the last couple of weeks.`,
  'trend-down': (name) => `${name} has quietly slipped the last couple of weeks.`,
}

export default function InsightsCard() {
  const { checkins } = useApp()
  const insights = useMemo(() => buildInsights(checkins), [checkins])
  const [detailOpen, setDetailOpen] = useState(false)

  const content = (
    <>
      <p className="insights-eyebrow">Last 30 days</p>

      {insights.ready ? (
        <>
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
          <div className="insights-more">
            <span>See the full picture</span>
            <ChevronRight size={15} strokeWidth={2.25} />
          </div>
        </>
      ) : (
        <p className="insights-empty">Check in a bit more and patterns will start to show up here.</p>
      )}
    </>
  )

  if (!insights.ready) {
    return <div className="insights-card">{content}</div>
  }

  return (
    <>
      <button
        type="button"
        className="insights-card insights-card-tap tap-target"
        onClick={() => setDetailOpen(true)}
      >
        {content}
      </button>

      <AnimatePresence>
        {detailOpen && <InsightsDetailSheet onClose={() => setDetailOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
