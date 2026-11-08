import { useCountdown } from '../hooks/useCountdown'

// The truth is already known locally (it's my own secret), so instead of
// trusting the player to self-report honestly, only the truthful button is
// clickable — the other is shown but disabled. No possible way to lie.
export default function IncomingGuessModal({ guess, turnDeadline, onConfirm }) {
  const remaining = useCountdown(turnDeadline)
  if (!guess) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card-base relative w-full max-w-md p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-danger">L'avversario tenta un colpo</p>
        <p className="mt-2 text-2xl font-extrabold">
          Il tuo personaggio è <span className="text-primary">{guess.characterName}</span>?
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Il gioco conosce già la verità: puoi solo confermarla, non puoi mentire.
        </p>

        {remaining !== null && (
          <p className={`mt-2 text-sm font-bold ${remaining <= 10 ? 'text-danger' : 'text-gray-400'}`}>
            ⏱ {remaining}s per confermare
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="btn-primary flex-1 !bg-success"
            disabled={!guess.correct}
            onClick={onConfirm}
          >
            Sì
          </button>
          <button
            type="button"
            className="btn-primary flex-1 !bg-danger"
            disabled={guess.correct}
            onClick={onConfirm}
          >
            No
          </button>
        </div>
      </div>
    </div>
  )
}
