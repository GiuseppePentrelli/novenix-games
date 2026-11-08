import { useState } from 'react'
import { CATEGORIES } from '../game/deck.js'
import { CAST_COST, purifyCost } from '../game/rules.js'
import ActionCard from './ActionCard.jsx'
import CastModal from './CastModal.jsx'
import CopyCode from './CopyCode.jsx'
import DenounceControl from './DenounceControl.jsx'
import GrimoireLog from './GrimoireLog.jsx'
import HelpOverlay from './HelpOverlay.jsx'
import SurvivalBar from './SurvivalBar.jsx'
import TurnAnnounce from './TurnAnnounce.jsx'

export default function Table({ state, myId, roomCode, isHost, onDispatch, onLeave }) {
  const [casting, setCasting] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showLog, setShowLog] = useState(false)

  const me = state.players[myId]
  // Se l'Officiante non gioca, non compare in classifica né come bersaglio.
  const playingPlayers = Object.fromEntries(
    Object.entries(state.players).filter(([id]) => state.hostPlays || id !== state.hostId)
  )
  const ranked = Object.values(playingPlayers).sort((a, b) => b.points - a.points)

  const myCurses = state.activeCurses.filter((c) => c.victimId === myId)
  const otherCurses = state.activeCurses.filter((c) => c.victimId !== myId)

  const turnPlayerId = state.turnOrder[state.turnIndex]
  const turnPlayer = state.players[turnPlayerId]
  const isMyTurn = turnPlayerId === myId

  if (!me) return null
  const canCast = isMyTurn && me.points >= CAST_COST

  return (
    <div className="min-h-svh flex flex-col pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-2 px-3 py-2.5 border-b border-[color:var(--color-ash)] bg-[color:var(--color-abyss)]/90 backdrop-blur">
        <button onClick={onLeave} className="text-xs text-[color:var(--color-parchment-dim)] underline">
          ← esci
        </button>
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)]">
          <span className="font-grimoire text-hex-glow tracking-widest text-sm">{roomCode}</span>
          <CopyCode code={roomCode} compact />
        </div>

        <button
          onClick={() => setShowHelp(true)}
          className="ml-auto w-7 h-7 rounded-full border border-[color:var(--color-ash)] text-[color:var(--color-parchment-dim)] hover:text-hex-glow hover:border-[color:var(--color-hex)] transition-colors text-sm"
          title="Come si gioca"
        >
          ?
        </button>
        <div className="flex items-center gap-2 pl-2">
          <span className="text-2xl">{me.avatar}</span>
          <div className="leading-none text-right">
            <div className="font-grimoire text-2xl text-hex-glow">{me.points}</div>
            <div className="text-[9px] uppercase tracking-widest text-[color:var(--color-parchment-dim)]">
              punti
            </div>
          </div>
        </div>
      </header>

      {/* Il tuo nome, sempre grande e visibile */}
      <div className="text-center py-2 border-b border-[color:var(--color-ash)]/60">
        <span className="font-grimoire text-2xl md:text-3xl text-[color:var(--color-parchment)]">
          {me.avatar} Sei <span className="text-hex-glow">{me.name}</span>
        </span>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-4 p-3 md:p-4">
        <section className="lg:col-span-2 flex flex-col gap-5">
          {/* HERO: turno corrente + azione da compiere — il centro dell'attenzione */}
          <div
            className={`grimoire-panel p-4 md:p-6 border-2 ${
              isMyTurn ? 'border-[color:var(--color-hex)]' : 'border-[color:var(--color-ash)]'
            }`}
          >
            <h2 className="font-grimoire text-2xl md:text-3xl text-center mb-1">
              {isMyTurn ? (
                <span className="text-hex-glow">🪞 TOCCA A TE</span>
              ) : (
                <span className="text-[color:var(--color-parchment)]">
                  🪞 Turno di {turnPlayer?.avatar} {turnPlayer?.name ?? '…'}
                </span>
              )}
            </h2>
            <p className="text-center text-sm font-body italic text-[color:var(--color-parchment-dim)] mb-4">
              {isHost
                ? isMyTurn
                  ? 'Esegui l\'azione, rispettando le tue maledizioni attive, poi giudica tu stesso l\'esito.'
                  : `Guarda ${turnPlayer?.name ?? 'il giocatore'} eseguire la sua azione, poi giudica tu l'esito qui sotto.`
                : isMyTurn
                  ? 'Esegui l\'azione qui sotto rispettando le tue maledizioni attive. Sarà l\'Officiante a dire se ce l\'hai fatta.'
                  : `Guarda ${turnPlayer?.name ?? 'il giocatore'} eseguire la sua azione. Nel frattempo puoi denunciare chi sbaglia, qui sotto.`}
            </p>

            {state.currentAction ? (
              <div className="flex flex-col items-center gap-4">
                <ActionCard action={state.currentAction.action} reveal autoReveal={false} />
                {isHost ? (
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
                ) : isMyTurn ? (
                  <p className="text-sm text-[color:var(--color-parchment-dim)] italic font-body">
                    Sarà l'Officiante a giudicare se ce l'hai fatta…
                  </p>
                ) : (
                  <p className="text-sm text-[color:var(--color-parchment-dim)] italic font-body">
                    In attesa che {turnPlayer?.name ?? 'il giocatore'} concluda…
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center text-[color:var(--color-parchment-dim)] italic font-body">
                Nessuna azione in corso.
              </p>
            )}
          </div>

          {/* Le tue maledizioni: cosa devi rispettare */}
          {myCurses.length > 0 && (
            <div className="grimoire-panel p-4 md:p-5 border-2 border-[color:var(--color-blood)]">
              <h2 className="font-grimoire text-xl text-hex-glow mb-1 flex items-center gap-2">
                🩸 SEI MALEDETTO ({myCurses.length})
              </h2>
              <p className="text-xs font-body text-[color:var(--color-parchment-dim)] mb-3">
                Rispetta questi vincoli in ogni momento, non solo nel tuo turno — se sbagli, chi ti sente può denunciarti.
              </p>
              <ul className="flex flex-col gap-3">
                {myCurses.map((c) => {
                  const cost = purifyCost(c.curse.severity)
                  return (
                    <li
                      key={c.instanceId}
                      className="hex-strike border border-[color:var(--color-hex)]/40 rounded-xl p-4 bg-[color:var(--color-abyss)]/60"
                    >
                      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)] mb-1">
                        <span>
                          {CATEGORIES[c.curse.category]?.icon} {c.curse.category}
                        </span>
                        <span>{'☠'.repeat(c.curse.severity)}</span>
                      </div>
                      <h3 className="font-grimoire text-xl text-hex-glow">{c.curse.title}</h3>
                      <p className="font-body text-xl italic leading-snug">{c.curse.text}</p>
                      <SurvivalBar curse={c} />
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-[color:var(--color-parchment-dim)]">
                          da {state.players[c.casterId]?.avatar} {state.players[c.casterId]?.name}
                        </span>
                        <button
                          className="sigil-btn venom !px-3 !py-2 text-sm"
                          disabled={me.points < cost}
                          title={me.points < cost ? 'Punti insufficienti' : 'Rimuovi pagando'}
                          onClick={() =>
                            onDispatch({ type: 'PURIFY', instanceId: c.instanceId, by: myId })
                          }
                        >
                          🧿 Purifica −{cost}
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Denuncia: la cosa più visibile dopo l'azione */}
          <div className="grimoire-panel p-4 md:p-5">
            <h2 className="font-grimoire text-xl text-venom-glow mb-1">👁 DENUNCIA CHI SBAGLIA</h2>
            <p className="text-xs font-body text-[color:var(--color-parchment-dim)] mb-3">
              Qualcuno ha appena violato la sua maledizione? Beccalo qui sotto — deve poi confermare l'Officiante.
            </p>
            {otherCurses.length === 0 ? (
              <p className="text-[color:var(--color-parchment-dim)] italic font-body">
                Nessuna maledizione attiva sugli altri, per ora.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {otherCurses.map((c) => {
                  const victim = state.players[c.victimId]
                  return (
                    <li
                      key={c.instanceId}
                      className="border-2 border-[color:var(--color-venom)]/50 rounded-xl p-4 bg-[color:var(--color-abyss)]/60 flex flex-col gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{victim?.avatar}</span>
                        <div>
                          <div className="font-body text-lg leading-none">{victim?.name ?? '?'}</div>
                          <div className="text-xs text-[color:var(--color-parchment-dim)]">
                            {victim?.points} punti
                          </div>
                        </div>
                        {!victim?.connected && (
                          <span title="disconnesso" className="opacity-40 ml-auto">💨</span>
                        )}
                        <span className="ml-auto text-sm">{'☠'.repeat(c.curse.severity)}</span>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)]">
                          {CATEGORIES[c.curse.category]?.icon} {c.curse.category}
                        </div>
                        <h3 className="font-grimoire text-lg text-[color:var(--color-parchment)]">
                          {c.curse.title}
                        </h3>
                        <p className="font-body text-lg italic leading-snug">{c.curse.text}</p>
                      </div>

                      <SurvivalBar curse={c} />

                      <DenounceControl curse={c} isHost={isHost} myId={myId} onDispatch={onDispatch} />

                      {isHost && (
                        <button
                          className="sigil-btn !py-1.5 text-xs self-end"
                          onClick={() =>
                            onDispatch({ type: 'REVOKE', instanceId: c.instanceId, by: myId })
                          }
                          title="Revoca (Officiante)"
                        >
                          ⛧ Revoca
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>

        {/* Classifica + grimorio: secondari, meno ingombranti */}
        <aside className="flex flex-col gap-4">
          <div className="grimoire-panel p-4 md:p-5">
            <h2 className="font-grimoire text-lg text-[color:var(--color-parchment)] mb-3">🏆 Le anime</h2>
            <ul className="flex flex-col gap-1">
              {ranked.map((p, i) => (
                <li
                  key={p.id}
                  className={`flex items-center gap-2 text-sm rounded-md px-2 py-1 ${
                    p.id === myId ? 'bg-[color:var(--color-hex)]/10' : ''
                  } ${p.id === turnPlayerId ? 'ring-1 ring-[color:var(--color-hex)]' : ''}`}
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

      {/* Azione principale */}
      <div className="fixed bottom-0 inset-x-0 z-20 p-3 flex flex-col items-center gap-1 bg-gradient-to-t from-[color:var(--color-abyss)] via-[color:var(--color-abyss)]/90 to-transparent pt-8">
        <button
          className={`sigil-btn blood text-lg px-10 ${canCast ? 'flicker' : ''}`}
          disabled={!canCast}
          onClick={() => setCasting(true)}
        >
          🩸 Scaglia una maledizione (−{CAST_COST})
        </button>
        {!isMyTurn ? (
          <span className="text-xs text-[color:var(--color-parchment-dim)] font-body">
            Puoi maledire solo nel tuo turno
          </span>
        ) : (
          me.points < CAST_COST && (
            <span className="text-xs text-[color:var(--color-blood)] font-body">
              Essenza insufficiente — denuncia qualcuno per recuperare
            </span>
          )
        )}
      </div>

      {casting && (
        <CastModal
          me={me}
          players={playingPlayers}
          activeCurses={state.activeCurses}
          onClose={() => setCasting(false)}
          onCast={({ victimId, category }) =>
            onDispatch({ type: 'CAST', casterId: myId, victimId, category })
          }
        />
      )}
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      <TurnAnnounce state={state} />
    </div>
  )
}
