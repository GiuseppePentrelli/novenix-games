import { AnimatePresence, motion } from 'framer-motion'

export default function LifeLostToast({ toast }) {
  return (
    <div className="toast-layer">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="life-toast"
            initial={{ opacity: 0, y: -18, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <span className="life-toast-icon">💥</span>
            <span className="life-toast-text">
              <strong>{toast.name}</strong> perde una vita{' '}
              {toast.livesLeft > 0 ? '❤️'.repeat(toast.livesLeft) : '💀 eliminato'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
