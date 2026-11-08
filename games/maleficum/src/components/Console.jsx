import { useState } from 'react'
import { CATEGORIES } from '../game/deck.js'
import { CAST_COST, denounceReward, purifyCost } from '../game/rules.js'
import ActionCard from './ActionCard.jsx'
import ActionTimer, { secondsIn } from './ActionTimer.jsx'
import CastModal from './CastModal.jsx'
import CurseReveal from './CurseReveal.jsx'
import DenounceModal from './DenounceModal.jsx'
import GrimoireLog from './GrimoireLog.jsx'
import HelpOverlay from './HelpOverlay.jsx'
import SalaLink from './SalaLink.jsx'
import SurvivalBar from './SurvivalBar.jsx'
import TurnAnnounce from './TurnAnnounce.jsx'

const VOTES = [
  [0, 'Fallita'],
  [1, 'Sufficiente'],
  [2, 'Buona'],
  [3, 'Memorabile'],
]

const headerBtn =
  'h-9 min-w-9 px-2.5 rounded-full border border-[color:var(--color-ash)] text-sm text-[color:var(--color-parchment-dim)] hover:text-hex-glow hover:border-[color:var(--color-hex)] transition-colors disabled:opacity-30 disabled:pointer-events-none'

// Console dell'Officiante: un solo telefono governa tutto il rito.
export default function Console({ state, dispatch, undo, canUndo }) {
  const [casting, setCasting] = useState(false)
  const [denouncing, setDenouncing] = useState(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)

  const turnPlayerId = state.turnOrder[state.turnIndex]
  const turnPlayer = state.players[turnPlayerId]
  const upcoming = state.turnOrder.length > 1
    ? Array.from({ length: Math.min(3, state.turnOrder.length - 1) }, (_, k) =>
        state.players[state.turnOrder[(state.turnIndex + k + 1) % state.turnOrder.length]])
    : []
  const cursesOf = (id) => state.activeCurses.filter((c) => c.victimId === id)
  const ranked = Object.values(state.players).sort((a, b) => b.points - a.points)
  const seating = state.turnOrder.map((id) => state.players[id])
  const action = state.currentAction?.action
  const canCast = turnPlayer && turnPlayer.points >= CAST_COST
  const { goal, round } = state
  const goalText =
    goal.type === 'rounds'
      ? `Giro ${round} di ${goal.value}`
      : goal.type === 'points'
        ? `Giro ${round} · a ${goal.value} punti`
        : `Giro ${round}`

  if (!turnPlayer) return null

  return (
    <div className="min-h-svh flex flex-col pb-10">
      <header className="sticky top-0 z-20 flex items-center gap-2 px-3 py-2.5 border-b border-[color:var(--color-ash)] bg-[color:var(--color-abyss)]/90 backdrop-blur">
        <SalaLink />
        <span className="mx-auto text-center text-[11px] leading-tight uppercase tracking-widest text-[color:var(--color-ember)]">
          {goalText}
        </span>
        <div className="flex items-center gap-1.5">
          <button className={headerBtn} onClick={undo} disabled={!canUndo} title="Annulla l'ultima mossa">
            ↶ <span className="hidden sm:inline">Annulla</span>
          </button>
          <button className={headerBtn} onClick={() => setShowHelp(true)} aria-label="Come si gioca">
            ?
          </button>
          <button className={headerBtn} onClick={() => setConfirmEnd(true)} title="Chiudi il rito">
            🏁 <span className="hidden sm:inline">Fine</span>
          </button>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-3 gap-4 p-3 md:p-4">
        <section className="lg:col-span-2 flex flex-col gap-5">
          {/* Turno corrente: carta azione e giudizio */}
          <div className="grimoire-panel p-4 md:p-6 border-2 border-[color:var(--color-hex)]">
            <h2 className="font-grimoire text-2xl md:text-3xl text-center text-hex-glow">
              🪞 Turno di {turnPlayer.avatar} {turnPlayer.name}
            </h2>
            <p className="text-center font-body text-[color:var(--color-parchment-dim)]">
              {turnPlayer.points} punti
              {upcoming.length > 0 && (
                <> · poi {upcoming.map((p) => p.name).join(' → ')}</>
              )}
            </p>

            {cursesOf(turnPlayerId).length > 0 && (
              <ul className="mt-3 flex flex-wrap justify-center gap-2">
                {cursesOf(turnPlayerId).map((c) => (
                  <li
                    key={c.instanceId}
                    className="text-xs uppercase tracking-widest rounded-full border border-[color:var(--color-blood)] px-3 py-1 text-[color:var(--color-ember)]"
                  >
                    🩸 {c.curse.title}
                  </li>
                ))}
              </ul>
            )}

            {action ? (
              <div className="flex flex-col items-center gap-4 mt-4">
                <ActionCard action={action} reveal autoReveal={false} />
                <ActionTimer key={state.currentAction.instanceId} seconds={secondsIn(action.text)} />
                <div className="w-full max-w-[340px]">
                  <p className="text-xs uppercase tracking-widest text-center text-[color:var(--color-parchment-dim)] mb-2">
                    Il tuo voto alla prova
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {VOTES.map(([score, label]) => (
                      <button
                        key={score}
                        className={`sigil-btn !px-1 !py-2.5 flex flex-col items-center gap-0.5 ${score === 3 ? 'blood' : ''}`}
                        onClick={() => dispatch({ type: 'ACTION_RESOLVE', score })}
                      >
                        <span className="font-grimoire text-2xl leading-none">{score === 0 ? '✗' : `+${score}`}</span>
                        <span className="text-[9px] tracking-wider normal-case">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 w-full max-w-[340px]">
                  <button
                    className="sigil-btn venom !py-2.5 text-sm flex-1"
                    disabled={!canCast}
                    title={canCast ? '' : 'Essenza insufficiente'}
                    onClick={() => setCasting(true)}
                  >
                    🩸 Scaglia (−{CAST_COST})
                  </button>
                  <button
                    className="sigil-btn !py-2.5 text-sm flex-1"
                    onClick={() => dispatch({ type: 'REDRAW_ACTION' })}
                  >
                    🔄 Altra azione
                  </button>
                </div>
                <p className="text-xs text-center font-body italic text-[color:var(--color-parchment-dim)] max-w-[340px]">
                  Se vuole, {turnPlayer.name} scaglia prima della prova. Poi dai il voto: il turno passa al prossimo.
                </p>
              </div>
            ) : (
              <p className="text-center text-[color:var(--color-parchment-dim)] italic font-body mt-4">
                Nessuna azione in corso.
              </p>
            )}
          </div>

          {/* Le anime nell'ordine dei turni, con punti e maledizioni */}
          <div className="grimoire-panel p-4 md:p-5">
            <h2 className="font-grimoire text-xl text-[color:var(--color-parchment)] mb-3">👥 Le anime</h2>
            <ul className="flex flex-col gap-3">
              {seating.map((p) => {
                const curses = cursesOf(p.id)
                return (
                  <li
                    key={p.id}
                    className={`border rounded-xl p-3 bg-[color:var(--color-abyss)]/40 ${
                      p.id === turnPlayerId ? 'border-[color:var(--color-hex)]' : 'border-[color:var(--color-ash)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{p.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-body text-xl truncate">
                          {p.name} {p.id === turnPlayerId && <span title="di turno">🪞</span>}
                        </div>
                        <div className="text-xs text-[color:var(--color-parchment-dim)]">
                          {curses.length === 0
                            ? 'nessuna maledizione'
                            : `${curses.length} ${curses.length === 1 ? 'maledizione attiva' : 'maledizioni attive'}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          className="sigil-btn !px-0 !py-0 w-8 h-8 text-lg"
                          onClick={() => dispatch({ type: 'ADJUST_POINTS', playerId: p.id, delta: -1 })}
                          aria-label={`Togli un punto a ${p.name}`}
                        >
                          −
                        </button>
                        <span className="font-grimoire text-2xl text-hex-glow w-10 text-center">{p.points}</span>
                        <button
                          className="sigil-btn !px-0 !py-0 w-8 h-8 text-lg"
                          onClick={() => dispatch({ type: 'ADJUST_POINTS', playerId: p.id, delta: 1 })}
                          aria-label={`Dai un punto a ${p.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {curses.length > 0 && (
                      <ul className="mt-3 flex flex-col gap-3">
                        {curses.map((c) => {
                          const cost = purifyCost(c.curse.severity)
                          const caster = state.players[c.casterId]
                          return (
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
                              <p className="font-body italic text-[color:var(--color-parchment-dim)]">{c.curse.text}</p>
                              <p className="text-xs text-[color:var(--color-parchment-dim)] mt-1">
                                da {caster?.avatar} {caster?.name}
                              </p>
                              <SurvivalBar curse={c} />
                              <div className="flex flex-wrap gap-2 mt-3">
                                <button
                                  className="sigil-btn blood !py-2 !px-3 text-sm flex-1"
                                  onClick={() => setDenouncing(c)}
                                >
                                  ⚡ Denuncia (+{denounceReward(c.curse.severity)})
                                </button>
                                <button
                                  className="sigil-btn venom !py-2 !px-3 text-sm flex-1"
                                  disabled={p.points < cost}
                                  title={p.points < cost ? 'Punti insufficienti' : 'Rimuovi pagando'}
                                  onClick={() => dispatch({ type: 'PURIFY', instanceId: c.instanceId })}
                                >
                                  🧿 Purifica −{cost}
                                </button>
                                <button
                                  className="sigil-btn !py-2 !px-3 text-sm"
                                  onClick={() => dispatch({ type: 'REVOKE', instanceId: c.instanceId })}
                                  title="Revoca senza punti"
                                >
                                  ⛧ Revoca
                                </button>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="grimoire-panel p-4 md:p-5">
            <h2 className="font-grimoire text-lg text-[color:var(--color-parchment)] mb-3">🏆 Classifica</h2>
            <ol className="flex flex-col gap-1">
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
                  <span className="ml-auto font-grimoire text-hex-glow">{p.points}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grimoire-panel p-4 md:p-5">
            <button
              className="w-full flex items-center justify-between font-grimoire text-lg text-[color:var(--color-parchment)]"
              onClick={() => setShowLog((v) => !v)}
              aria-expanded={showLog}
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

      {casting && (
        <CastModal
          me={turnPlayer}
          players={state.players}
          activeCurses={state.activeCurses}
          onClose={() => setCasting(false)}
          onCast={({ victimId, category }) =>
            dispatch({ type: 'CAST', casterId: turnPlayerId, victimId, category })
          }
        />
      )}
      {denouncing && (
        <DenounceModal
          curse={denouncing}
          players={state.players}
          onClose={() => setDenouncing(null)}
          onResolve={(payload) => dispatch({ type: 'DENOUNCE', ...payload })}
        />
      )}
      {confirmEnd && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setConfirmEnd(false)}
        >
          <div className="grimoire-panel w-full max-w-sm p-6 flex flex-col gap-4 text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-grimoire text-2xl text-hex-glow">Chiudere il rito?</h2>
            <p className="font-body text-[color:var(--color-parchment-dim)]">
              Vedrai la classifica finale. Potrai ancora tornare indietro con «Annulla».
            </p>
            <div className="flex gap-2">
              <button className="sigil-btn flex-1" onClick={() => setConfirmEnd(false)}>
                Continua
              </button>
              <button
                className="sigil-btn blood flex-1"
                onClick={() => {
                  setConfirmEnd(false)
                  dispatch({ type: 'END_GAME' })
                }}
              >
                🏁 Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      {state.reveal && (
        <CurseReveal
          reveal={state.reveal}
          state={state}
          onResolve={(payload) => dispatch({ type: 'RESOLVE_INSTANT', ...payload })}
          onDismiss={() => dispatch({ type: 'DISMISS_REVEAL' })}
        />
      )}
      <TurnAnnounce state={state} />
    </div>
  )
}
