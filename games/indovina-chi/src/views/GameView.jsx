import { useEffect, useState } from 'react'
import { useGame } from '../context/GameContext'
import TurnBanner from '../components/TurnBanner'
import SecretBadge from '../components/SecretBadge'
import CharacterBoard from '../components/CharacterBoard'
import QuestionPanel from '../components/QuestionPanel'
import GameLog from '../components/GameLog'
import IncomingQuestionModal from '../components/IncomingQuestionModal'
import IncomingGuessModal from '../components/IncomingGuessModal'
import GuessModal from '../components/GuessModal'
import CharacterDetailModal from '../components/CharacterDetailModal'

export default function GameView() {
  const {
    state,
    questions,
    characters,
    mode,
    askQuestion,
    answerIncomingQuestion,
    submitGuess,
    confirmIncomingGuess,
    toggleEliminated,
    leaveGame,
  } = useGame()
  const [showGuessModal, setShowGuessModal] = useState(false)
  const [detailCharacter, setDetailCharacter] = useState(null)
  const [questionPaused, setQuestionPaused] = useState(false)
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false)

  // Whenever a new question arrives, make sure it's shown (not left paused
  // from a previous one).
  useEffect(() => {
    setQuestionPaused(false)
  }, [state.pendingIncomingQuestion?.id])

  // Close the mobile sheet automatically whenever it's no longer my turn to act.
  useEffect(() => {
    if (state.turn !== 'me' || state.awaitingGuessResult) {
      setMobilePanelOpen(false)
    }
  }, [state.turn, state.awaitingGuessResult])

  const canAct = state.turn === 'me' && !state.awaitingGuessResult
  const showQuestionModal = state.pendingIncomingQuestion && !questionPaused

  const handleAsk = (question) => {
    askQuestion(question)
    setMobilePanelOpen(false)
  }

  const handleOpenGuess = () => {
    setMobilePanelOpen(false)
    setShowGuessModal(true)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-3 p-3 pb-24 lg:grid lg:grid-cols-[1fr_320px] lg:gap-4 lg:p-6 lg:pb-6">
      <div className="flex flex-col gap-3 lg:gap-4">
        <div className="flex items-center gap-3">
          <SecretBadge character={state.mySecret} onClick={() => setDetailCharacter(state.mySecret)} />
          <div className="flex-1">
            <TurnBanner turn={state.turn} turnDeadline={state.turnDeadline} waitingForAnswer={state.awaitingGuessResult} />
          </div>
        </div>

        {state.pendingIncomingQuestion && questionPaused && (
          <button
            type="button"
            className="btn-primary animate-pulse"
            onClick={() => setQuestionPaused(false)}
          >
            Domanda in sospeso — tocca per rispondere
          </button>
        )}

        <CharacterBoard
          board={state.board}
          onToggle={toggleEliminated}
          onViewDetail={(id) => setDetailCharacter(state.board.find((c) => c.id === id))}
        />
      </div>

      {/* Desktop sidebar: question panel + log always visible, there's room for it. */}
      <div className="hidden lg:flex lg:flex-col lg:gap-4">
        <QuestionPanel
          questions={questions}
          disabled={!canAct}
          onAsk={askQuestion}
          onOpenGuess={() => setShowGuessModal(true)}
          allowCustom={mode === 'multiplayer'}
        />
        <GameLog log={state.log} />
        <button
          type="button"
          className="text-center text-xs text-gray-400 underline"
          onClick={() => {
            leaveGame()
            window.location.href = window.location.pathname
          }}
        >
          Abbandona la partita
        </button>
      </div>

      {/* Mobile: a compact trigger instead of a permanently open panel. */}
      <div className="lg:hidden">
        {canAct && !mobilePanelOpen && (
          <button
            type="button"
            className="btn-primary fixed inset-x-3 bottom-3 z-20"
            onClick={() => setMobilePanelOpen(true)}
          >
            Fai una domanda o indovina
          </button>
        )}

        {mobilePanelOpen && (
          <div
            className="fixed inset-0 z-20 flex items-end bg-black/40"
            onClick={() => setMobilePanelOpen(false)}
          >
            <div
              className="w-full rounded-t-3xl bg-board p-3 pb-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMobilePanelOpen(false)}
                  className="text-2xl font-bold leading-none text-gray-400 hover:text-gray-600"
                  aria-label="Chiudi"
                >
                  &times;
                </button>
              </div>
              <QuestionPanel
                questions={questions}
                disabled={!canAct}
                onAsk={handleAsk}
                onOpenGuess={handleOpenGuess}
                allowCustom={mode === 'multiplayer'}
              />
            </div>
          </div>
        )}
      </div>

      <details className="card-base p-3 lg:hidden">
        <summary className="cursor-pointer text-sm font-bold text-gray-500">
          Cronologia ({state.log.length})
        </summary>
        <div className="mt-2">
          <GameLog log={state.log} />
        </div>
      </details>

      <button
        type="button"
        className="text-center text-xs text-gray-400 underline lg:hidden"
        onClick={() => {
          leaveGame()
          window.location.href = window.location.pathname
        }}
      >
        Abbandona la partita
      </button>

      {showGuessModal && (
        <GuessModal
          characters={characters}
          onClose={() => setShowGuessModal(false)}
          onConfirm={(characterId) => {
            submitGuess(characterId)
            setShowGuessModal(false)
          }}
        />
      )}

      {showQuestionModal && (
        <IncomingQuestionModal
          question={state.pendingIncomingQuestion}
          turnDeadline={state.turnDeadline}
          onAnswer={answerIncomingQuestion}
          onDismiss={() => setQuestionPaused(true)}
        />
      )}

      {state.pendingIncomingGuess && (
        <IncomingGuessModal
          guess={state.pendingIncomingGuess}
          turnDeadline={state.turnDeadline}
          onConfirm={confirmIncomingGuess}
        />
      )}

      {detailCharacter && (
        <CharacterDetailModal character={detailCharacter} onClose={() => setDetailCharacter(null)} />
      )}
    </div>
  )
}
