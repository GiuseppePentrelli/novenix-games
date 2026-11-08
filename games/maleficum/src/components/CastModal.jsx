import { useState } from 'react'
import { CATEGORIES } from '../game/deck.js'
import { CAST_COST, MAX_CURSES_PER_VICTIM } from '../game/rules.js'

// Modale per scagliare una maledizione a nome di chi è di turno: vittima + capitolo (o sorte).
export default function CastModal({ me, players, activeCurses, onCast, onClose }) {
  const [victimId, setVictimId] = useState(null)
  const [category, setCategory] = useState(null) // null = sorte casuale

  const canAfford = me.points >= CAST_COST
  const countOn = (id) => activeCurses.filter((c) => c.victimId === id).length
  const targets = Object.values(players).filter((p) => p.id !== me.id)

  const victimFull = victimId ? countOn(victimId) >= MAX_CURSES_PER_VICTIM : false
  const ready = canAfford && victimId && !victimFull

  return (
    <div
      className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="grimoire-panel w-full max-w-lg p-6 flex flex-col gap-5 hex-strike max-h-[92svh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <h2 className="font-grimoire text-2xl text-hex-glow">{me.avatar} {me.name} scaglia</h2>
          <p className="text-sm font-body text-[color:var(--color-parchment-dim)]">
            Costa <span className="text-[color:var(--color-ember)]">{CAST_COST} punti</span> · ne ha{' '}
            <span className={canAfford ? 'text-hex-glow' : 'text-[color:var(--color-blood)]'}>
              {me.points}
            </span>
          </p>
        </div>

        {!canAfford && (
          <p className="text-center text-[color:var(--color-blood)] font-body text-sm">
            ⚠ Essenza insufficiente: servono altri punti per maledire.
          </p>
        )}

        {/* Vittima */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)] mb-2">
            Su chi cade il maleficio?
          </p>
          {targets.length === 0 ? (
            <p className="text-[color:var(--color-parchment-dim)] italic text-sm">
              Nessun'altra anima nel cerchio…
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {targets.map((p) => {
                const full = countOn(p.id) >= MAX_CURSES_PER_VICTIM
                return (
                  <button
                    key={p.id}
                    disabled={full}
                    onClick={() => setVictimId(p.id)}
                    title={full ? 'Anima sovraccarica di malefici' : ''}
                    className={`sigil-btn !px-3 !py-2 text-sm ${
                      victimId === p.id ? '!border-[color:var(--color-hex)] text-hex-glow' : ''
                    }`}
                  >
                    {p.avatar} {p.name}{' '}
                    <span className="text-[color:var(--color-parchment-dim)]">
                      ({countOn(p.id)}/{MAX_CURSES_PER_VICTIM})
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Categoria */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)] mb-2">
            Da quale capitolo del grimorio?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCategory(null)}
              className={`sigil-btn !px-3 !py-2 text-sm ${
                category === null ? '!border-[color:var(--color-hex)] text-hex-glow' : ''
              }`}
            >
              🎲 A sorte
            </button>
            {Object.entries(CATEGORIES).map(([name, meta]) => (
              <button
                key={name}
                onClick={() => setCategory(name)}
                className={`sigil-btn !px-3 !py-2 text-sm ${
                  category === name ? '!border-[color:var(--color-hex)] text-hex-glow' : ''
                }`}
              >
                {meta.icon} {name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-1">
          <button className="sigil-btn flex-1" onClick={onClose}>
            Annulla
          </button>
          <button
            className="sigil-btn blood flex-1 text-lg"
            disabled={!ready}
            onClick={() => {
              onCast({ victimId, category })
              onClose()
            }}
          >
            🩸 Maledici (−{CAST_COST})
          </button>
        </div>
      </div>
    </div>
  )
}
