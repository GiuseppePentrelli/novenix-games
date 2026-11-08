import { useCountdown } from '../hooks/useCountdown'

export default function TurnBanner({ turn, turnDeadline, waitingForAnswer = false }) {
  const isMyTurn = turn === 'me'
  const remaining = useCountdown(turnDeadline)

  return (
    <div
      className={[
        'card-base flex items-center justify-center gap-3 px-4 py-3 text-center font-extrabold uppercase tracking-wide',
        isMyTurn ? 'bg-accent text-white' : 'bg-white text-gray-500',
      ].join(' ')}
    >
      <span>
        {isMyTurn ? (waitingForAnswer ? 'In attesa della risposta...' : 'Il tuo turno') : "Turno dell'avversario"}
      </span>
      {isMyTurn && remaining !== null && (
        <span className={remaining <= 10 ? 'animate-pulse rounded-full bg-danger px-2 py-0.5 text-sm' : 'text-sm'}>
          ⏱ {remaining}s
        </span>
      )}
    </div>
  )
}
