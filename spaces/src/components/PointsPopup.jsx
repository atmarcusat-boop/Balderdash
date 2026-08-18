import { AnimatePresence, motion } from 'framer-motion'
import { Coins } from 'lucide-react'

export default function PointsPopup({ pointsEvent }) {
  return (
    <div className="points-popup-anchor">
      <AnimatePresence>
        {pointsEvent && (
          <motion.div
            key={pointsEvent.id}
            className="points-popup"
            initial={{ opacity: 0, y: 8, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1, 0], y: [8, -18, -34, -54], scale: [0.6, 1.15, 1, 1] }}
            transition={{ duration: 1.1, times: [0, 0.18, 0.75, 1], ease: 'easeOut' }}
          >
            <Coins size={16} strokeWidth={2.5} />
            <span>+{pointsEvent.value}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
