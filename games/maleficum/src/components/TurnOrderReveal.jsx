import { useEffect, useState } from 'react'

// Rivela in sequenza il tiro di ogni giocatore, in ordine di turno
// (primo a giocare in cima). Puro CSS/timeout, nessuna immagine.
export default function TurnOrderReveal({ turnOrder, rolls, players, onDone }) {
  const [revealed, setRevealed] = useState(0)

  useEffect(() => {
    if (revealed >= turnOrder.length) return
    const t = setTimeout(() => setRevealed((n) => n + 1), 700)
    return () => clearTimeout(t)
  }, [revealed, turnOrder.length])

  const done = revealed >= turnOrder.length

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="grimoire-panel w-full max-w-md p-6 flex flex-col gap-4 hex-strike">
        <h2 className="font-grimoire text-2xl text-hex-glow text-center">
          🎲 Il fato decide l'ordine
        </h2>
        <ul className="flex flex-col gap-2">
          {turnOrder.map((id, i) => {
            const p = players[id]
            const shown = i < revealed
            const rolling = i === revealed
            return (
              <li
                key={id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border transition-all duration-500 ${
                  shown
                    ? 'border-[color:var(--color-hex)] bg-[color:var(--color-hex)]/10 opacity-100'
                    : 'border-[color:var(--color-ash)] opacity-50'
                }`}
              >
                <span className="w-7 text-[color:var(--color-parchment-dim)] font-grimoire">
                  {i + 1}°
                </span>
                <span className="text-2xl">{p?.avatar ?? '✦'}</span>
                <span className="font-body flex-1 truncate">{p?.name ?? '?'}</span>
                <span
                  className={`font-grimoire text-xl w-12 text-right ${
                    shown ? 'text-hex-glow' : ''
                  } ${rolling ? 'rune-pulse' : ''}`}
                >
                  {shown ? `🎲${rolls[id] ?? '?'}` : '🎲'}
                </span>
              </li>
            )
          })}
        </ul>
        {done ? (
          <button className="sigil-btn blood mt-1 text-lg" onClick={onDone}>
            Che il rito abbia inizio!
          </button>
        ) : (
          <p className="text-center text-xs text-[color:var(--color-parchment-dim)] italic font-body">
            I dadi rotolano…
          </p>
        )}
      </div>
    </div>
  )
}
