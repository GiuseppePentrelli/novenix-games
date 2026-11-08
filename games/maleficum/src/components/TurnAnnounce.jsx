import { useEffect, useRef, useState } from 'react'
import { CATEGORIES } from '../game/deck.js'

// Popup che appare ad ogni cambio di turno: annuncia chi gioca e
// ricorda a tutti quali maledizioni ha ancora addosso, cosi il
// performer sa cosa rispettare e gli altri sanno cosa "beccare".
export default function TurnAnnounce({ state }) {
  const turnPlayerId = state.turnOrder[state.turnIndex]
  const [visible, setVisible] = useState(false)
  const lastShownRef = useRef(null)

  useEffect(() => {
    if (!turnPlayerId || lastShownRef.current === turnPlayerId) return
    lastShownRef.current = turnPlayerId
    setVisible(true)
  }, [turnPlayerId])

  if (!visible || !turnPlayerId) return null

  const player = state.players[turnPlayerId]
  const curses = state.activeCurses.filter((c) => c.victimId === turnPlayerId)

  return (
    <div
      className="fixed inset-0 z-40 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setVisible(false)}
    >
      <div
        className="grimoire-panel w-full max-w-md p-6 flex flex-col gap-4 hex-strike"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-grimoire text-2xl text-center text-hex-glow">
          🪞 Turno di {player?.avatar} {player?.name ?? '?'}
        </h2>

        {curses.length === 0 ? (
          <p className="text-center text-[color:var(--color-parchment-dim)] italic font-body">
            Nessuna maledizione attiva su {player?.name ?? 'di lui/lei'}, per ora.
          </p>
        ) : (
          <>
            <p className="text-center text-xs uppercase tracking-widest text-[color:var(--color-ember)]">
              ⚠ Vincoli da rispettare — occhio a chi sbaglia
            </p>
            <ul className="flex flex-col gap-2">
              {curses.map((c) => (
                <li
                  key={c.instanceId}
                  className="border border-[color:var(--color-hex)]/40 rounded-lg p-3 bg-[color:var(--color-abyss)]/60"
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)]">
                    <span>
                      {CATEGORIES[c.curse.category]?.icon} {c.curse.category}
                    </span>
                    <span>{'☠'.repeat(c.curse.severity)}</span>
                  </div>
                  <div className="font-grimoire text-lg text-hex-glow">{c.curse.title}</div>
                  <p className="font-body italic text-[color:var(--color-parchment)]">{c.curse.text}</p>
                </li>
              ))}
            </ul>
          </>
        )}

        <button className="sigil-btn blood mt-1" onClick={() => setVisible(false)}>
          Ho capito
        </button>
      </div>
    </div>
  )
}
