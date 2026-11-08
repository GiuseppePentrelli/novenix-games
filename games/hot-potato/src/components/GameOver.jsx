import { motion } from 'framer-motion'

export default function GameOver({ winnerName, onRestart }) {
  return (
    <motion.div
      className="screen result-screen winner-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        className="result-content"
      >
        <div className="trophy-emoji">🏆</div>
        <h2 className="result-title winner-title">{winnerName} VINCE!</h2>
        <p className="result-sub">L'unico sopravvissuto alla patata bollente 🥔</p>
        <motion.button
          className="btn-start"
          onClick={onRestart}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          RIGIOCA 🔁
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
