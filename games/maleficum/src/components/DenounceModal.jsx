import { useState } from 'react'
import { CATEGORIES } from '../game/deck.js'
import { denounceReward } from '../game/rules.js'

// L'Officiante indica chi ha smascherato la vittima e decide subito l'esito.
export default function DenounceModal({ curse, players, onResolve, onClose }) {
  const [accuserId, setAccuserId] = useState(null)
  const victim = players[curse.victimId]
  const accusers = Object.values(players).filter((p) => p.id !== curse.victimId)
  const stake = denounceReward(curse.curse.severity)
  const accuser = players[accuserId]

  const resolve = (approve) => {
    onResolve({ instanceId: curse.instanceId, accuserId, approve })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="grimoire-panel w-full max-w-lg p-6 flex flex-col gap-5 max-h-[92svh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <h2 className="font-grimoire text-2xl text-venom-glow">⚡ Denuncia</h2>
          <p className="font-body text-[color:var(--color-parchment-dim)]">
            {victim?.avatar} {victim?.name} avrebbe violato
          </p>
          <p className="font-grimoire text-lg text-[color:var(--color-parchment)]">
            {CATEGORIES[curse.curse.category]?.icon} {curse.curse.title}
          </p>
          <p className="font-body italic text-[color:var(--color-parchment-dim)]">{curse.curse.text}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)] mb-2">
            Chi l'ha smascherato?
          </p>
          <div className="flex flex-wrap gap-2">
            {accusers.map((p) => (
              <button
                key={p.id}
                onClick={() => setAccuserId(p.id)}
                aria-pressed={accuserId === p.id}
                className={`sigil-btn !px-3 !py-2 text-sm ${
                  accuserId === p.id ? '!border-[color:var(--color-hex)] text-hex-glow' : ''
                }`}
              >
                {p.avatar} {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button className="sigil-btn blood text-lg" disabled={!accuser} onClick={() => resolve(true)}>
            ✅ Confermo{accuser ? `: ${accuser.name} ruba ${stake}` : ` (+${stake})`}
          </button>
          <div className="flex gap-2">
            <button className="sigil-btn flex-1" onClick={onClose}>
              Annulla
            </button>
            <button className="sigil-btn flex-1" disabled={!accuser} onClick={() => resolve(false)}>
              ❌ Respingo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
