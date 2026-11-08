import { useCountdown } from '../hooks/useCountdown'

export default function IncomingQuestionModal({ question, turnDeadline, onAnswer, onDismiss }) {
  const remaining = useCountdown(turnDeadline)
  if (!question) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card-base relative w-full max-w-md p-6 text-center">
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-3 top-3 text-2xl font-bold text-gray-300 hover:text-gray-500"
          aria-label="Metti in pausa"
        >
          &times;
        </button>

        <p className="text-xs font-semibold uppercase tracking-wide text-primary">L'avversario chiede</p>
        <p className="mt-2 text-2xl font-extrabold">{question.text}</p>

        {remaining !== null && (
          <p className={`mt-2 text-sm font-bold ${remaining <= 10 ? 'text-danger' : 'text-gray-400'}`}>
            ⏱ {remaining}s per rispondere
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button type="button" className="btn-primary flex-1 !bg-success" onClick={() => onAnswer(true)}>
            Sì
          </button>
          <button type="button" className="btn-primary flex-1 !bg-danger" onClick={() => onAnswer(false)}>
            No
          </button>
        </div>

        <button type="button" className="mt-4 text-xs text-gray-400 underline" onClick={onDismiss}>
          Metti in pausa e guarda la mia carta
        </button>
      </div>
    </div>
  )
}
