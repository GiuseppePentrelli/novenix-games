import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Setup from './components/Setup'
import Game from './components/Game'
import GameOver from './components/GameOver'
import CategoryTransition from './components/CategoryTransition'
import LifeLostToast from './components/LifeLostToast'
import { randomRound } from './data/categories'
import { useBombAudio } from './hooks/useBombAudio'
import './styles.css'

const START_LIVES = 3
const ROUND_START_TIME = 15
const TURN_DECREMENT = 2
const MIN_TURN_TIME = 4
const TOAST_MS = 1400

function nextAliveIndex(players, fromIndex) {
  const n = players.length
  for (let step = 1; step <= n; step++) {
    const idx = (fromIndex + step) % n
    if (players[idx].lives > 0) return idx
  }
  return fromIndex
}

function countAlive(players) {
  return players.filter((p) => p.lives > 0).length
}

export default function App() {
  const [phase, setPhase] = useState('setup')
  const [players, setPlayers] = useState([])
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [round, setRound] = useState(null)
  const [passesInRound, setPassesInRound] = useState(0)
  const [answersInCycle, setAnswersInCycle] = useState(0)
  const [pendingWinner, setPendingWinner] = useState(null)
  const [toast, setToast] = useState(null)

  const { primeAudio, tick, explode } = useBombAudio()

  const turnDuration = Math.max(MIN_TURN_TIME, ROUND_START_TIME - passesInRound * TURN_DECREMENT)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), TOAST_MS)
    return () => clearTimeout(t)
  }, [toast])

  const handleStart = useCallback((names) => {
    primeAudio()
    const initialPlayers = names.map((name, i) => ({ id: i, name, lives: START_LIVES }))
    setPlayers(initialPlayers)
    setCurrentPlayerIndex(0)
    setRound(randomRound())
    setPassesInRound(0)
    setAnswersInCycle(0)
    setPendingWinner(null)
    setToast(null)
    setPhase('transition')
  }, [primeAudio])

  // Avanza al giocatore successivo, mantenendo categoria/lettere finché non ha
  // risposto tutta la rosa dei giocatori vivi (poi ne genera una nuova).
  const advanceTurn = useCallback((alivePlayers, fromIndex) => {
    setPassesInRound((p) => p + 1)
    setCurrentPlayerIndex(nextAliveIndex(alivePlayers, fromIndex))

    const nextAnswers = answersInCycle + 1
    if (nextAnswers >= countAlive(alivePlayers)) {
      setAnswersInCycle(0)
      setRound(randomRound())
      setPhase('transition')
    } else {
      setAnswersInCycle(nextAnswers)
    }
  }, [answersInCycle])

  const handlePass = useCallback(() => {
    advanceTurn(players, currentPlayerIndex)
  }, [players, currentPlayerIndex, advanceTurn])

  const handleTransitionDone = useCallback(() => {
    setPhase('playing')
  }, [])

  const handleExplode = useCallback(() => {
    explode()
    const updated = players.map((p, i) => (i === currentPlayerIndex ? { ...p, lives: Math.max(0, p.lives - 1) } : p))
    const loser = updated[currentPlayerIndex]
    setPlayers(updated)

    if (countAlive(updated) <= 1) {
      setPendingWinner(updated.find((p) => p.lives > 0)?.name ?? loser.name)
      setPhase('gameOver')
      return
    }

    setToast({ id: Date.now(), name: loser.name, livesLeft: loser.lives })
    advanceTurn(updated, currentPlayerIndex)
  }, [players, currentPlayerIndex, explode, advanceTurn])

  const handleRestart = useCallback(() => {
    setPhase('setup')
    setPlayers([])
    setRound(null)
    setPassesInRound(0)
    setAnswersInCycle(0)
    setPendingWinner(null)
    setToast(null)
  }, [])

  return (
    <div className="app-shell">
      <LifeLostToast toast={toast} />
      <AnimatePresence mode="wait">
        {phase === 'setup' && <Setup key="setup" onStart={handleStart} />}

        {phase === 'playing' && round && (
          <Game
            key="playing"
            round={round}
            turnDuration={turnDuration}
            players={players}
            currentPlayerIndex={currentPlayerIndex}
            onPass={handlePass}
            onExplode={handleExplode}
            tick={tick}
          />
        )}

        {phase === 'transition' && round && (
          <CategoryTransition key="transition" round={round} onDone={handleTransitionDone} />
        )}

        {phase === 'gameOver' && pendingWinner && (
          <GameOver key="gameOver" winnerName={pendingWinner} onRestart={handleRestart} />
        )}
      </AnimatePresence>
    </div>
  )
}
