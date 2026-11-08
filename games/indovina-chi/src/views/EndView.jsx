import { useMemo } from 'react'
import { useGame } from '../context/GameContext'
import { describeCharacter } from '../lib/characterInfo'

const OUTCOME_CONTENT = {
  victory: {
    title: 'Hai vinto!',
    className: 'text-success',
    emoji: '🏆',
  },
  defeat: {
    title: 'Hai perso!',
    className: 'text-danger',
    emoji: '💥',
  },
  'opponent-left': {
    title: "L'avversario si è disconnesso",
    subtitle: 'La partita è terminata prima del previsto.',
    className: 'text-gray-500',
    emoji: '🔌',
  },
}

// Same outcome (victory/defeat) can happen for two different reasons — I
// guessed the opponent's character, or the opponent guessed mine (or missed
// it) — so the subtitle has to reflect *why*, not just win/lose.
const REASON_SUBTITLE = {
  'my-guess-correct': 'Hai smascherato il personaggio segreto!',
  'opponent-guessed-wrong': "L'avversario ha sbagliato il tentativo!",
  'my-guess-wrong': 'Hai sbagliato il tentativo di indovinare.',
  'opponent-guessed-me': 'L\'avversario ha indovinato il tuo personaggio.',
}

const CONFETTI_COLORS = ['#7C3AED', '#F59E0B', '#16A34A', '#E11D48', '#A78BFA']

export default function EndView() {
  const { state, requestRematch, leaveGame } = useGame()
  const content = OUTCOME_CONTENT[state.outcome] ?? OUTCOME_CONTENT.defeat
  const subtitle = REASON_SUBTITLE[state.outcomeReason] ?? content.subtitle
  const isVictory = state.outcome === 'victory'
  const isDefeat = state.outcome === 'defeat'

  const questionCount = state.log.filter((e) => e.type === 'question').length
  const myQuestionCount = state.log.filter((e) => e.type === 'question' && e.by === 'me').length
  const guessCount = state.log.filter((e) => e.type === 'guess').length

  const revealedLines = useMemo(() => describeCharacter(state.opponentSecretRevealed), [state.opponentSecretRevealed])

  // Random but stable for the lifetime of this screen.
  const confetti = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.8 + Math.random() * 1.4,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    [],
  )

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden p-4">
      {isVictory && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {confetti.map((c) => (
            <span
              key={c.id}
              className="confetti-piece"
              style={{
                left: `${c.left}%`,
                backgroundColor: c.color,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className={`card-base relative w-full max-w-md p-8 text-center ${isDefeat ? 'animate-pop-shake' : 'animate-pop-in'}`}>
        <p className="text-7xl">{content.emoji}</p>
        <h1 className={`mt-4 text-3xl font-extrabold ${content.className}`}>{content.title}</h1>
        <p className="mt-1 text-sm text-gray-400">{subtitle}</p>

        {state.opponentSecretRevealed && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm text-gray-500">Il personaggio dell'avversario era:</p>
            <img
              src={state.opponentSecretRevealed.img}
              alt={state.opponentSecretRevealed.nome}
              className="h-28 w-28 rounded-2xl object-cover shadow-card"
            />
            <p className="text-lg font-extrabold">{state.opponentSecretRevealed.nome}</p>
            {revealedLines.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-2">
                {revealedLines.map((line) => (
                  <li
                    key={line.key}
                    className="flex items-center gap-1 rounded-full bg-primary-light/10 px-3 py-1 text-xs font-bold text-primary-dark"
                  >
                    <span aria-hidden="true">{line.icon}</span>
                    <span>{line.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {state.outcome !== 'opponent-left' && (
          <div className="mt-6 flex justify-center gap-3 text-sm">
            <div className="rounded-xl bg-gray-50 px-4 py-2">
              <p className="text-xl font-extrabold text-primary">{questionCount}</p>
              <p className="text-xs text-gray-400">Domande totali</p>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-2">
              <p className="text-xl font-extrabold text-primary">{myQuestionCount}</p>
              <p className="text-xs text-gray-400">Tue domande</p>
            </div>
            <div className="rounded-xl bg-gray-50 px-4 py-2">
              <p className="text-xl font-extrabold text-primary">{guessCount}</p>
              <p className="text-xs text-gray-400">Tentativi</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {state.outcome !== 'opponent-left' && (
            <button type="button" className="btn-primary" onClick={requestRematch}>
              Rigioca
            </button>
          )}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              leaveGame()
              window.location.href = window.location.pathname
            }}
          >
            Torna alla Lobby
          </button>
        </div>
      </div>
    </div>
  )
}
