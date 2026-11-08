import { useEffect, useState } from 'react'

export const secondsIn = (text) => Number(text?.match(/(\d+)\s*secondi/)?.[1]) || null

// Cronometro per le prove a tempo («per 20 secondi»): l'Officiante lo
// avvia quando la prova comincia, e allo scadere il telefono vibra.
export default function ActionTimer({ seconds }) {
  const [endsAt, setEndsAt] = useState(null)
  const [now, setNow] = useState(() => Date.now())

  const left = endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : seconds
  const done = endsAt && left === 0

  useEffect(() => {
    if (!endsAt || done) return
    const iv = setInterval(() => setNow(Date.now()), 200)
    return () => clearInterval(iv)
  }, [endsAt, done])

  useEffect(() => {
    if (done) navigator.vibrate?.([200, 100, 200])
  }, [done])

  if (!seconds) return null

  return (
    <div className="flex items-center gap-3 w-full max-w-[340px]">
      <div
        className={`flex-1 h-12 rounded-xl border flex items-center justify-center font-grimoire text-2xl ${
          done
            ? 'border-[color:var(--color-blood)] text-[color:var(--color-blood)] flicker'
            : endsAt
              ? 'border-[color:var(--color-ember)] text-[color:var(--color-ember)]'
              : 'border-[color:var(--color-ash)] text-[color:var(--color-parchment-dim)]'
        }`}
        role="timer"
        aria-live={done ? 'assertive' : 'off'}
      >
        {done ? 'Tempo!' : `⏱ ${left}s`}
      </div>
      <button
        className="sigil-btn !py-3 text-sm"
        onClick={() => {
          setNow(Date.now())
          setEndsAt(endsAt && !done ? null : Date.now() + seconds * 1000)
        }}
      >
        {endsAt && !done ? '■ Ferma' : done ? '↻ Ancora' : '▶ Avvia'}
      </button>
    </div>
  )
}
