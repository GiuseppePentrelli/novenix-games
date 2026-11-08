import { useEffect, useRef, useState } from 'react'
import { TOTAL_ROUNDS, useGameEngine } from '../hooks/useGameEngine.js'
import Logo from './Logo.jsx'
import TeamPanels from './TeamPanels.jsx'
import Board from './Board.jsx'
import FeedbackBanner from './FeedbackBanner.jsx'
import RoundOverPanel from './RoundOverPanel.jsx'

export default function ClassicView({ initialState }) {
  const {
    state,
    category,
    roundOver,
    revealCorrect,
    submitGuess,
    switchTeam,
    cancelPending,
    nextCategory,
    newMatch,
  } = useGameEngine(initialState)

  const [guessText, setGuessText] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    document.title = 'TOP 10 - Quiz'
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [state.currentTeam, roundOver])

  function handleSubmit(e) {
    e.preventDefault()
    submitGuess(guessText)
    setGuessText('')
  }

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

        <Board
          items={category.items}
          revealed={state.revealed}
          interactive={!!state.pending}
          onReveal={revealCorrect}
          justRevealedIndex={state.justRevealedIndex}
        />

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
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                ref={inputRef}
                type="text"
                value={guessText}
                onChange={(e) => setGuessText(e.target.value)}
                disabled={!!state.pending}
                placeholder={`Risposta per ${state.teamNames[state.currentTeam]}...`}
                className="flex-1 min-w-0 rounded-lg bg-slate-800 border border-slate-600 px-4 py-3 text-lg focus:outline-none focus:border-emerald-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!!state.pending}
                className="rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 px-6 py-3 font-semibold text-slate-900 shrink-0"
              >
                Rispondi
              </button>
            </form>

            {state.feedback && <FeedbackBanner feedback={state.feedback} />}

            {state.pending && (
              <div className="rounded-lg border border-slate-500 bg-slate-800 p-4 flex flex-col gap-3">
                <p className="text-sm text-slate-300">
                  Nessuna corrispondenza automatica. Se e' comunque giusta, clicca la casella corrispondente qui sopra.
                  Altrimenti scegli un'opzione:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={cancelPending}
                    className="rounded-lg bg-slate-600 hover:bg-slate-500 px-4 py-2 font-semibold text-white"
                  >
                    Annulla (riprova)
                  </button>
                  <button
                    type="button"
                    onClick={() => switchTeam('wrong')}
                    className="rounded-lg bg-red-600 hover:bg-red-500 px-4 py-2 font-semibold text-white"
                  >
                    Segna sbagliata (cambia turno)
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
