import { useState } from 'react'
import { CATEGORIES } from '../game/deck.js'
import ActionCard from './ActionCard.jsx'
import CopyCode from './CopyCode.jsx'
import GrimoireLog from './GrimoireLog.jsx'
import SurvivalBar from './SurvivalBar.jsx'
import TurnAnnounce from './TurnAnnounce.jsx'

// Dashboard dell'Officiante che NON gioca: tiene tutto sotto controllo
// (chi è maledetto, quante maledizioni, punti, azione in corso) e
// giudica lui l'esito delle azioni e delle denunce. Gli altri
// giocatori possono solo denunciare, mai approvare/respingere.
export default function HostDashboard({ state, myId, roomCode, onDispatch, onLeave }) {
  const [showLog, setShowLog] = useState(false)

  const me = state.players[myId]
  const players = Object.values(state.players).filter((p) => p.id !== state.hostId)
  const ranked = [...players].sort((a, b) => b.points - a.points)

  const turnPlayerId = state.turnOrder[state.turnIndex]
  const turnPlayer = state.players[turnPlayerId]
  const cursesByVictim = (id) => state.activeCurses.filter((c) => c.victimId === id)

  if (!me) return null

  return (
    <div className="min-h-svh flex flex-col pb-10">
      <header className="sticky top-0 z-20 flex items-center gap-2 px-3 py-2.5 border-b border-[color:var(--color-ash)] bg-[color:var(--color-abyss)]/90 backdrop-blur">
        <button onClick={onLeave} className="text-xs text-[color:var(--color-parchment-dim)] underline">
          ← esci
        </button>
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)]">
          <span className="font-grimoire text-hex-glow tracking-widest text-sm">{roomCode}</span>
          <CopyCode code={roomCode} compact />
        </div>
        <span className="ml-auto text-xs uppercase tracking-widest text-venom-glow">👁 Dashboard Officiante</span>
      </header>

      {/* Il tuo nome, sempre grande e visibile */}
      <div className="text-center py-2 border-b border-[color:var(--color-ash)]/60">
        <span className="font-grimoire text-2xl md:text-3xl text-[color:var(--color-parchment)]">
          {me.avatar} Sei <span className="text-venom-glow">{me.name}</span>
        </span>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-4 p-3 md:p-4">
        <section className="lg:col-span-2 flex flex-col gap-5">
          {/* Turno corrente + azione da giudicare */}
          <div className="grimoire-panel p-4 md:p-6 border-2 border-[color:var(--color-hex)]">
            <h2 className="font-grimoire text-2xl md:text-3xl text-center text-hex-glow mb-1">
              🪞 Turno di {turnPlayer?.avatar} {turnPlayer?.name ?? '…'}
            </h2>
            <p className="text-center text-sm font-body italic text-[color:var(--color-parchment-dim)] mb-4">
              Guarda {turnPlayer?.name ?? 'il giocatore'} eseguire l'azione, poi giudica tu l'esito.
            </p>
            {state.currentAction ? (
              <div className="flex flex-col items-center gap-4">
                <ActionCard action={state.currentAction.action} reveal autoReveal={false} />
                <div className="flex gap-3 w-full max-w-[320px]">
                  <button
                    className="sigil-btn !py-3 text-base flex-1"
                    onClick={() => onDispatch({ type: 'ACTION_RESOLVE', by: myId, success: false })}
                  >
                    ✗ Fallita
                  </button>
                  <button
                    className="sigil-btn blood !py-3 text-base flex-1 flicker"
                    onClick={() => onDispatch({ type: 'ACTION_RESOLVE', by: myId, success: true })}
                  >
                    ✓ Riuscita (+{state.currentAction.action.reward})
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-center text-[color:var(--color-parchment-dim)] italic font-body">
                Nessuna azione in corso.
              </p>
            )}
          </div>

          {/* Panoramica: chi è maledetto, quante maledizioni, punti */}
          <div className="grimoire-panel p-4 md:p-5">
            <h2 className="font-grimoire text-xl text-[color:var(--color-parchment)] mb-3">
              👥 Le anime sotto controllo
            </h2>
            <ul className="flex flex-col gap-3">
              {players.map((p) => {
                const curses = cursesByVictim(p.id)
                return (
                  <li
                    key={p.id}
                    className="border border-[color:var(--color-ash)] rounded-xl p-3 bg-[color:var(--color-abyss)]/40"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{p.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-body text-xl truncate">{p.name}</div>
                        <div className="text-xs text-[color:var(--color-parchment-dim)]">
                          {curses.length === 0
                            ? 'nessuna maledizione'
                            : `${curses.length} ${curses.length === 1 ? 'maledizione attiva' : 'maledizioni attive'}`}
                        </div>
                      </div>
                      {p.id === turnPlayerId && (
                        <span className="text-xl" title="di turno">🪞</span>
                      )}
                      {!p.connected && (
                        <span title="disconnesso" className="opacity-40">💨</span>
                      )}
                      <span className="font-grimoire text-2xl text-hex-glow">{p.points}</span>
                    </div>

                    {curses.length > 0 && (
                      <ul className="mt-3 flex flex-col gap-3">
                        {curses.map((c) => (
                          <li key={c.instanceId} className="border-t border-[color:var(--color-ash)]/60 pt-3">
                            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)]">
                              <span>
                                {CATEGORIES[c.curse.category]?.icon} {c.curse.category}
                              </span>
                              <span>{'☠'.repeat(c.curse.severity)}</span>
                            </div>
                            <div className="font-grimoire text-lg text-[color:var(--color-parchment)]">
                              {c.curse.title}
                            </div>
                            <p className="text-sm italic font-body text-[color:var(--color-parchment-dim)]">
                              {c.curse.text}
                            </p>
                            <SurvivalBar curse={c} />

                            {c.pendingDenounce ? (
                              <div className="flex flex-col gap-2 mt-2">
                                <p className="text-xs text-center uppercase tracking-widest text-[color:var(--color-ember)]">
                                  ⚖ Accusa in sospeso — decidi tu
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    className="sigil-btn blood flex-1 !py-2 text-sm"
                                    onClick={() =>
                                      onDispatch({
                                        type: 'DENOUNCE_RESOLVE',
                                        instanceId: c.instanceId,
                                        by: myId,
                                        approve: true,
                                      })
                                    }
                                  >
                                    ✅ Confermo
                                  </button>
                                  <button
                                    className="sigil-btn flex-1 !py-2 text-sm"
                                    onClick={() =>
                                      onDispatch({
                                        type: 'DENOUNCE_RESOLVE',
                                        instanceId: c.instanceId,
                                        by: myId,
                                        approve: false,
                                      })
                                    }
                                  >
                                    ❌ Respingo
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                className="sigil-btn !py-1 !px-2 text-xs mt-2"
                                onClick={() =>
                                  onDispatch({ type: 'REVOKE', instanceId: c.instanceId, by: myId })
                                }
                                title="Revoca (emergenza)"
                              >
                                ⛧ Revoca
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        {/* Classifica + grimorio */}
        <aside className="flex flex-col gap-4">
          <div className="grimoire-panel p-4 md:p-5">
            <h2 className="font-grimoire text-lg text-[color:var(--color-parchment)] mb-3">🏆 Le anime</h2>
            <ul className="flex flex-col gap-1">
              {ranked.map((p, i) => (
                <li
                  key={p.id}
                  className={`flex items-center gap-2 text-sm rounded-md px-2 py-1 ${
                    p.id === turnPlayerId ? 'ring-1 ring-[color:var(--color-hex)]' : ''
                  }`}
                >
                  <span className="w-5 text-[color:var(--color-parchment-dim)]">{i + 1}</span>
                  <span className="text-xl">{p.avatar}</span>
                  <span className="font-body truncate">{p.name}</span>
                  {p.id === turnPlayerId && <span className="text-xs">🪞</span>}
                  <span className="ml-auto font-grimoire text-hex-glow">{p.points}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grimoire-panel p-4 md:p-5">
            <button
              className="w-full flex items-center justify-between font-grimoire text-lg text-[color:var(--color-parchment)]"
              onClick={() => setShowLog((v) => !v)}
            >
              <span>📜 Il grimorio</span>
              <span className="text-sm text-[color:var(--color-parchment-dim)]">
                {showLog ? '▲ nascondi' : '▼ mostra'}
              </span>
            </button>
            {showLog && (
              <div className="mt-3">
                <GrimoireLog log={state.log} />
              </div>
            )}
          </div>
        </aside>
      </div>
      <TurnAnnounce state={state} />
    </div>
  )
}
