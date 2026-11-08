import { useEffect, useState } from 'react'
import { ACTION_CATEGORIES } from '../game/actions.js'

const glowClass = {
  hex: 'text-hex-glow',
  venom: 'text-venom-glow',
  ember: 'text-[color:var(--color-ember)]',
  blood: 'text-[color:var(--color-blood)]',
}

// Carta dell'azione, stessa meccanica di flip 3D di CurseCard.
// Nessuna immagine: il fronte è puro CSS (icona + glow di categoria),
// pronto però ad accogliere `action.img` il giorno in cui esisterà l'arte.
export default function ActionCard({ action, reveal = true, autoReveal = false }) {
  const [revealed, setRevealed] = useState(reveal && !autoReveal)

  useEffect(() => {
    if (autoReveal) {
      const t = setTimeout(() => setRevealed(true), 120)
      return () => clearTimeout(t)
    }
    setRevealed(reveal)
  }, [reveal, autoReveal, action])

  if (!action) return null
  const cat = ACTION_CATEGORIES[action.category] ?? {}

  return (
    <div className="card-3d mx-auto w-[240px] h-[340px]">
      <div className={`card-3d-inner w-full h-full ${revealed ? 'revealed' : ''}`}>
        {/* Retro (sigillo): visibile quando NON rivelata */}
        <div className="card-face grimoire-panel flex items-center justify-center">
          <div className="text-6xl rune-pulse text-hex-glow font-grimoire select-none">✶</div>
        </div>

        {/* Fronte (azione): visibile quando rivelata */}
        <div className="card-face back grimoire-panel flex flex-col p-5 text-center">
          {action.img ? (
            <img
              src={action.img}
              alt=""
              className="absolute inset-0 w-full h-full object-cover rounded-[14px] opacity-30"
            />
          ) : null}

          <div className="relative flex items-center justify-between text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)]">
            <span>{cat.icon}</span>
            <span>{action.category}</span>
            <span>{'✦'.repeat(action.difficulty)}</span>
          </div>

          <div className="relative flex-1 flex flex-col items-center justify-center gap-4">
            <h3 className={`font-grimoire text-2xl leading-tight ${glowClass[cat.color] || 'text-hex-glow'}`}>
              {action.title}
            </h3>
            <p className="text-[color:var(--color-parchment)] text-lg italic leading-snug">
              {action.text}
            </p>
          </div>

          <div className="relative text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)]">
            ✓ successo +{action.reward}
          </div>
        </div>
      </div>
    </div>
  )
}
