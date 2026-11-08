import { useEffect, useState } from 'react'
import { categories } from '../data/categories.js'
import { TOTAL_ROUNDS } from '../hooks/useGameEngine.js'
import { loadState, subscribeState } from '../utils/storage.js'
import Logo from './Logo.jsx'
import TeamPanels from './TeamPanels.jsx'
import Board from './Board.jsx'
import FeedbackBanner from './FeedbackBanner.jsx'

export default function PlayerView() {
  const [state, setState] = useState(() => loadState())

  useEffect(() => {
    document.title = 'TOP 10 - Schermo giocatori'
    return subscribeState(setState)
  }, [])

  if (!state || state.phase !== 'playing') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center px-4">
        <div className="text-center flex flex-col items-center gap-4">
          <Logo subtitle={null} />
          <p className="text-slate-400">In attesa che l'host avvii la partita...</p>
        </div>
      </div>
    )
  }

  const category = categories[state.categoryIndex]
  const roundOver = state.revealed.every(Boolean)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 px-3 sm:px-4 py-6 sm:py-8 overflow-x-hidden">
      <div className="max-w-3xl mx-auto flex flex-col gap-5 sm:gap-6">
        <Logo subtitle={`Categoria ${state.matchRound} di ${TOTAL_ROUNDS}: ${category.title}`} />

        <TeamPanels
          teamNames={state.teamNames}
          scores={state.scores}
          currentTeam={state.currentTeam}
          timeLeft={state.timeLeft}
          roundOver={roundOver}
        />

        <Board items={category.items} revealed={state.revealed} justRevealedIndex={state.justRevealedIndex} />

        {roundOver ? (
          <p className="text-center text-slate-400">Tabellone completo: in attesa dell'host per continuare.</p>
        ) : (
          state.feedback && <FeedbackBanner feedback={state.feedback} />
        )}
      </div>
    </div>
  )
}
