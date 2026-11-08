import { useEffect } from 'react'
import { categories } from '../data/categories.js'
import { TOTAL_ROUNDS, useGameEngine } from '../hooks/useGameEngine.js'
import Logo from './Logo.jsx'
import TeamPanels from './TeamPanels.jsx'
import Board from './Board.jsx'
import FeedbackBanner from './FeedbackBanner.jsx'
import RoundOverPanel from './RoundOverPanel.jsx'

export default function HostView({ initialState }) {
  const {
    state,
    category,
    roundOver,
    revealCorrect,
    switchTeam,
    changeCategory,
    nextCategory,
    newMatch,
  } = useGameEngine(initialState)

  useEffect(() => {
    document.title = 'TOP 10 - Host'
  }, [])

  function openPlayerScreen() {
    const url = new URL(window.location.href)
    url.searchParams.set('view', 'player')
    window.open(url.toString(), '_blank', 'noopener')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 px-3 sm:px-4 py-6 sm:py-8 overflow-x-hidden">
      <div className="max-w-3xl mx-auto flex flex-col gap-5 sm:gap-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Logo small subtitle={null} />
          <button
            type="button"
            onClick={openPlayerScreen}
            className="rounded-lg bg-slate-800 border border-slate-600 hover:border-emerald-400 px-3 py-2 text-xs sm:text-sm"
          >
            Apri schermo giocatori
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Categoria {state.matchRound} di {TOTAL_ROUNDS}
          </p>
          <h2 className="text-lg sm:text-xl font-bold">{category.title}</h2>
        </div>

        <details className="rounded-lg border border-slate-700 bg-slate-800/40 px-3 py-2">
          <summary className="cursor-pointer text-sm text-slate-400 select-none">Cambia categoria manualmente</summary>
          <select
            value={state.categoryIndex}
            onChange={(e) => changeCategory(Number(e.target.value))}
            className="mt-2 w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm"
          >
            {categories.map((c, i) => (
              <option key={c.title} value={i}>
                {c.title}
              </option>
            ))}
          </select>
        </details>

        <TeamPanels
          teamNames={state.teamNames}
          scores={state.scores}
          currentTeam={state.currentTeam}
          timeLeft={state.timeLeft}
          roundOver={roundOver}
        />

        <Board items={category.items} revealed={state.revealed} interactive onReveal={revealCorrect} justRevealedIndex={state.justRevealedIndex} />

        {roundOver ? (
          <RoundOverPanel
            scores={state.scores}
            teamNames={state.teamNames}
            matchRound={state.matchRound}
            onNextCategory={nextCategory}
            onNewMatch={newMatch}
          />
        ) : (
          <>
            <button
              type="button"
              onClick={() => switchTeam('wrong')}
              className="rounded-lg bg-red-600 hover:bg-red-500 px-6 py-3 font-semibold text-white self-center"
            >
              Risposta sbagliata: cambia turno
            </button>
            {state.feedback && <FeedbackBanner feedback={state.feedback} />}
          </>
        )}

        <p className="text-center text-xs text-slate-500">
          Clicca su una casella coperta per assegnarla alla squadra in turno.
        </p>
      </div>
    </div>
  )
}
