import { useEffect, useRef, useState } from 'react'
import { useGame } from './game/useGame.js'
import Console from './components/Console.jsx'
import FinalRanking from './components/FinalRanking.jsx'
import Setup from './components/Setup.jsx'
import TurnOrderReveal from './components/TurnOrderReveal.jsx'

export default function App() {
  const { state, dispatch, undo, canUndo } = useGame()

  // Mostra la rivelazione del dado una sola volta, appena il cerchio è
  // formato e la partita passa da 'setup' a 'playing'.
  const [showReveal, setShowReveal] = useState(false)
  const prevPhaseRef = useRef(state.phase)
  useEffect(() => {
    if (prevPhaseRef.current === 'setup' && state.phase === 'playing') setShowReveal(true)
    prevPhaseRef.current = state.phase
  }, [state.phase])

  if (state.phase === 'setup') {
    return (
      <Setup
        lastNames={state.lastNames}
        goal={state.goal}
        onStart={(names, goal) => dispatch({ type: 'START_GAME', names, goal })}
      />
    )
  }

  if (state.phase === 'ended') {
    return (
      <FinalRanking
        state={state}
        canUndo={canUndo}
        onBack={undo}
        onNewGame={() => dispatch({ type: 'RESET' })}
      />
    )
  }

  if (showReveal) {
    return (
      <TurnOrderReveal
        turnOrder={state.turnOrder}
        rolls={state.rolls}
        players={state.players}
        onDone={() => setShowReveal(false)}
      />
    )
  }

  return <Console state={state} dispatch={dispatch} undo={undo} canUndo={canUndo} />
}
