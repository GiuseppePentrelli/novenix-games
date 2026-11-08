import { useEffect, useState } from 'react'
import { CATEGORIES } from '../game/deck.js'

const glowClass = {
  hex: 'text-hex-glow',
  venom: 'text-venom-glow',
  ember: 'text-[color:var(--color-ember)]',
  blood: 'text-[color:var(--color-blood)]',
}

// Carta della maledizione con pesca/flip 3D.
// `reveal` controlla se la carta è girata (fronte visibile).
export default function CurseCard({ curse, reveal = true, autoReveal = false }) {
  const [revealed, setRevealed] = useState(reveal && !autoReveal)

  useEffect(() => {
    if (autoReveal) {
      const t = setTimeout(() => setRevealed(true), 120)
      return () => clearTimeout(t)
    }
    setRevealed(reveal)
  }, [reveal, autoReveal, curse])

  if (!curse) return null
  const cat = CATEGORIES[curse.category] ?? {}

  return (
    <div className="card-3d mx-auto w-[240px] h-[340px]">
      <div className={`card-3d-inner w-full h-full ${revealed ? 'revealed' : ''}`}>
        {/* Retro (sigillo): visibile quando NON rivelata */}
        <div className="card-face grimoire-panel flex items-center justify-center">
          <div className="text-6xl rune-pulse text-hex-glow font-grimoire select-none">
            ✶
          </div>
        </div>

        {/* Fronte (maledizione): visibile quando rivelata */}
        <div className="card-face back grimoire-panel flex flex-col p-5 text-center">
          {curse.img ? (
            <img
              src={curse.img}
              alt=""
              className="absolute inset-0 w-full h-full object-cover rounded-[14px] opacity-30"
            />
          ) : null}

          <div className="relative flex items-center justify-between text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)]">
            <span>{cat.icon}</span>
            <span>{curse.category}</span>
            <span>{'☠'.repeat(curse.severity)}</span>
          </div>

          <div className="relative flex-1 flex flex-col items-center justify-center gap-4">
            <h3 className={`font-grimoire text-2xl leading-tight ${glowClass[cat.color] || 'text-hex-glow'}`}>
              {curse.title}
            </h3>
            <p className="text-[color:var(--color-parchment)] text-lg italic leading-snug">
              {curse.text}
            </p>
          </div>

          <div className="relative text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)]">
            {curse.kind === 'timer'
              ? `⏳ ${curse.turns} turni`
              : curse.kind === 'instant'
                ? '⚡ Istantanea'
                : '∞ Vincolo attivo'}
          </div>
        </div>
      </div>
    </div>
  )
}
