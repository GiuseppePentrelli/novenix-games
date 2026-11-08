import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

// Il ticchettio parte lento (un colpo quasi ogni secondo) e accelera man mano
// che il tempo rimasto si avvicina allo zero.
const MAX_TICK_INTERVAL = 0.9
const MIN_TICK_INTERVAL = 0.12

export default function Game({ round, turnDuration, players, currentPlayerIndex, onPass, onExplode, tick }) {
  const [remaining, setRemaining] = useState(turnDuration)
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const nextTickAtRef = useRef(0)
  const explodedRef = useRef(false)

  const currentPlayer = players[currentPlayerIndex]

  useEffect(() => {
    explodedRef.current = false
    startRef.current = performance.now()
    nextTickAtRef.current = 0
    setRemaining(turnDuration)

    function frame(now) {
      const elapsed = (now - startRef.current) / 1000
      const left = Math.max(0, turnDuration - elapsed)
      setRemaining(left)

      if (left > 0 && elapsed >= nextTickAtRef.current) {
        const progress = left / turnDuration
        tick(1 - progress)
        const interval = MIN_TICK_INTERVAL + (MAX_TICK_INTERVAL - MIN_TICK_INTERVAL) * progress
        nextTickAtRef.current = elapsed + interval
      }

      if (left <= 0) {
        if (!explodedRef.current) {
          explodedRef.current = true
          onExplode()
        }
        return
      }
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)

    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnDuration, currentPlayerIndex])

  const progress = Math.max(0, remaining / turnDuration)
  const urgency = 1 - progress
  const secondsLabel = Math.max(0, remaining).toFixed(1)
  const isCritical = remaining <= turnDuration * 0.25

  const circumference = 2 * Math.PI * 54

  return (
    <motion.div
      className={`screen game-screen ${isCritical ? 'critical' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ '--urgency': urgency }}
    >
      <div className="speed-lines" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="speed-line" style={{ animationDelay: `${i * 0.07}s` }} />
        ))}
      </div>

      <div className="lives-bar">
        {players.map((p, i) => (
          <div key={p.id} className={`life-chip ${i === currentPlayerIndex ? 'active' : ''} ${p.lives <= 0 ? 'eliminated' : ''}`}>
            <span className="life-chip-name">{p.name}</span>
            <span className="life-chip-hearts">
              {'❤️'.repeat(Math.max(0, p.lives))}
              {p.lives <= 0 && '💀'}
            </span>
          </div>
        ))}
      </div>

      <div className="category-card">
        <span className="category-label">Categoria</span>
        <h2 className="category-text">{round.category}</h2>
        <div className="letters-badge">
          <span className="letters-star" aria-hidden="true" />
          <span className="letters-text">{round.letters}</span>
        </div>
      </div>

      <div className="turn-indicator">
        Tocca a <strong>{currentPlayer.name}</strong>
      </div>

      <div className="bomb-zone">
        <motion.div
          className="bomb"
          animate={{
            rotate: isCritical ? [-4, 4, -4] : [0, 0],
            scale: isCritical ? [1, 1.06, 1] : 1,
          }}
          transition={{ duration: isCritical ? 0.18 : 0.4, repeat: Infinity }}
        >
          <svg className="timer-ring" viewBox="0 0 120 120">
            <circle className="timer-ring-bg" cx="60" cy="60" r="54" />
            <circle
              className="timer-ring-fg"
              cx="60"
              cy="60"
              r="54"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          </svg>
          <div className="potato-mascot">
            <span className="potato-fuse" aria-hidden="true" />
            <span className="potato-flame" aria-hidden="true">🔥</span>
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
          <span className="bomb-seconds">{secondsLabel}s</span>
        </motion.div>
      </div>

      <motion.button
        className="btn-pass"
        onClick={onPass}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
      >
        Passa la patata! →
      </motion.button>
    </motion.div>
  )
}
