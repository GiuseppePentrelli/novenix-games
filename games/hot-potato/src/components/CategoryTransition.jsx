import { useEffect } from 'react'
import { motion } from 'framer-motion'

const PAUSE_MS = 1000

export default function CategoryTransition({ round, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, PAUSE_MS)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      className="screen transition-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className="transition-content"
        initial={{ scale: 0.7, opacity: 0, rotate: -3 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 16 }}
      >
        <span className="transition-eyebrow">Round successivo</span>
        <h2 className="transition-category">{round.category}</h2>
        <div className="transition-letter">
          <span className="letters-star" aria-hidden="true" />
          <span className="letters-text">{round.letters}</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
