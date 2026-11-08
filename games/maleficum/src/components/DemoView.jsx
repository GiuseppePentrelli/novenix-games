import { useState } from 'react'
import { useLocalGame } from '../net/useLocalGame.js'
import Table from './Table.jsx'
import HostDashboard from './HostDashboard.jsx'
import TurnOrderReveal from './TurnOrderReveal.jsx'

// Vista di anteprima: il Tavolo popolato con dati finti + controlli
// per cambiare "chi sei" e generare eventi. Nessuna rete.
export default function DemoView({ onExit }) {
  const demo = useLocalGame()
  // Si apre mostrando subito la rivelazione del dado, come farebbe
  // una partita vera appena finita la lobby.
  const [showReveal, setShowReveal] = useState(true)

  // Stessa regola di App.jsx: l'host vede la dashboard solo se ha
  // scelto di non giocare.
  const showDashboard = demo.isHost && !demo.state.hostPlays

  if (showReveal) {
    return (
      <TurnOrderReveal
        turnOrder={demo.state.turnOrder}
        rolls={demo.state.rolls}
        players={demo.state.players}
        onDone={() => setShowReveal(false)}
      />
    )
  }

  return (
    <>
      {showDashboard ? (
        <HostDashboard
          state={demo.state}
          myId={demo.myId}
          roomCode={demo.roomCode}
          onDispatch={demo.dispatch}
          onLeave={onExit}
        />
      ) : (
        <Table
          state={demo.state}
          myId={demo.myId}
          roomCode={demo.roomCode}
          isHost={demo.isHost}
          onDispatch={demo.dispatch}
          onLeave={onExit}
        />
      )}

      {/* Barra di controllo demo */}
      <div className="fixed bottom-3 left-3 z-30 grimoire-panel px-3 py-2 flex flex-col gap-2 max-w-[240px]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-[color:var(--color-ember)] font-grimoire">
            ● Anteprima
          </span>
          <button
            onClick={() => setShowReveal(true)}
            className="sigil-btn !px-2 !py-1 text-[11px]"
            title="Rivedi l'animazione del tiro dei dadi"
          >
            🎲 Tiro
          </button>
          <button
            onClick={demo.randomEvent}
            className="sigil-btn !px-2 !py-1 text-[11px]"
            title="Un bot maledice qualcuno, poi si giudica l'azione"
          >
            ▶ Evento
          </button>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-[color:var(--color-parchment-dim)] mb-1">
            L'host ("Tu") gioca?
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => {
                demo.restart(true)
                demo.setMyId('you')
                setShowReveal(true)
              }}
              className={`sigil-btn !px-2 !py-1 text-[11px] flex-1 ${
                demo.state.hostPlays ? '!border-[color:var(--color-hex)] text-hex-glow' : ''
              }`}
            >
              🎭 Sì
            </button>
            <button
              onClick={() => {
                demo.restart(false)
                demo.setMyId('you')
                setShowReveal(true)
              }}
              className={`sigil-btn !px-2 !py-1 text-[11px] flex-1 ${
                !demo.state.hostPlays ? '!border-[color:var(--color-hex)] text-hex-glow' : ''
              }`}
            >
              👁 No
            </button>
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-widest text-[color:var(--color-parchment-dim)] mb-1">
            Sei:
          </div>
          <div className="flex gap-1">
            {demo.players.map((p) => (
              <button
                key={p.id}
                onClick={() => demo.setMyId(p.id)}
                title={p.name}
                className={`w-8 h-8 rounded-md border text-lg flex items-center justify-center ${
                  p.id === demo.myId
                    ? 'border-[color:var(--color-hex)] bg-[color:var(--color-hex)]/15'
                    : 'border-[color:var(--color-ash)]'
                }`}
              >
                {p.avatar}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
