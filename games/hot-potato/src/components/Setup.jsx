import { useState } from 'react'
import { motion } from 'framer-motion'

const MIN_PLAYERS = 2
const MAX_PLAYERS = 12

export default function Setup({ onStart }) {
  const [count, setCount] = useState(3)
  const [names, setNames] = useState(['', '', ''])

  function changeCount(next) {
    const clamped = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, next))
    setCount(clamped)
    setNames((prev) => {
      const copy = prev.slice(0, clamped)
      while (copy.length < clamped) copy.push('')
      return copy
    })
  }

  function updateName(index, value) {
    setNames((prev) => {
      const copy = [...prev]
      copy[index] = value
      return copy
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const finalNames = names.map((n, i) => n.trim() || `Giocatore ${i + 1}`)
    onStart(finalNames)
  }

  return (
    <motion.div
      className="screen setup-screen"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="setup-header">
        <div className="setup-logo-icon" aria-hidden="true">
          <div className="potato-mascot potato-mascot--logo">
            <span className="potato-fuse" />
            <span className="potato-flame">🔥</span>
            <div className="potato-body">
              <span className="potato-spot spot-1" />
              <span className="potato-spot spot-2" />
              <span className="potato-spot spot-3" />
              <div className="potato-eyes">
                <span className="potato-eye"><span className="potato-pupil" /></span>
                <span className="potato-eye"><span className="potato-pupil" /></span>
              </div>
              <span className="potato-mouth" />
            </div>
          </div>
        </div>
        <h1 className="title-flame">HOT POTATO</h1>
        <p className="subtitle">Parola a Tempo — la patata bollente che non aspetta nessuno</p>
      </div>

      <form className="setup-form" onSubmit={handleSubmit}>
        <div className="player-count-row">
          <span className="field-label">Giocatori</span>
          <div className="stepper">
            <button type="button" className="stepper-btn" onClick={() => changeCount(count - 1)} disabled={count <= MIN_PLAYERS}>
              −
            </button>
            <span className="stepper-value">{count}</span>
            <button type="button" className="stepper-btn" onClick={() => changeCount(count + 1)} disabled={count >= MAX_PLAYERS}>
              +
            </button>
          </div>
        </div>

        <div className="name-list">
          {names.map((name, i) => (
            <motion.input
              key={i}
              type="text"
              className="name-input"
              placeholder={`Giocatore ${i + 1}`}
              value={name}
              maxLength={16}
              onChange={(e) => updateName(i, e.target.value)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            />
          ))}
        </div>

        <motion.button
          type="submit"
          className="btn-start"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          AVVIA 🔥
        </motion.button>
      </form>
    </motion.div>
  )
}
