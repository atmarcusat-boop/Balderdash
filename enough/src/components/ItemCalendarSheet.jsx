import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { SECTION_BY_ID } from '../data/items'
import { buildMonths } from '../lib/grid'
import ItemGrid from './ItemGrid'

const MONTHS_BACK = 12

export default function ItemCalendarSheet({ item, onClose }) {
  const months = useMemo(() => buildMonths(MONTHS_BACK), [])
  const Icon = item.icon
  const section = SECTION_BY_ID[item.section]

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
        <div className="sheet-calendar-title">
          <div className="icon-badge icon-badge-xs" style={{ '--section-color': section.color }}>
            <Icon size={14} strokeWidth={2.25} />
          </div>
          <h2 className="sheet-title">{item.name}</h2>
        </div>
        <p className="sheet-sub">The last year, at a glance.</p>

        <div className="sheet-calendar-body">
          <ItemGrid item={item} months={months} showHeader={false} />
        </div>

        <button type="button" className="btn btn-ghost sheet-close tap-target" onClick={onClose}>
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}
