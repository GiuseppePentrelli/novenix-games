import { useState } from 'react'
import CopyCode from './CopyCode.jsx'

// Sala d'attesa: mostra il codice stanza e le anime connesse.
export default function WaitingRoom({ state, myId, roomCode, isHost, onStart, onLeave }) {
  const [hostPlays, setHostPlays] = useState(true)
  const players = Object.values(state.players)
  const me = state.players[myId]

  const playingCount = hostPlays ? players.length : players.length - 1
  const canStart = playingCount >= 2

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-10 gap-8">
      <button
        onClick={onLeave}
        className="absolute top-4 left-4 text-xs text-[color:var(--color-parchment-dim)] underline"
      >
        ← abbandona
      </button>

      {me && (
        <p className="font-grimoire text-2xl md:text-3xl text-center text-[color:var(--color-parchment)]">
          {me.avatar} Sei <span className="text-hex-glow">{me.name}</span>
        </p>
      )}

      <div className="text-center flex flex-col items-center gap-2">
        <p className="text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)]">
          Codice del cerchio
        </p>
        <div className="font-grimoire text-6xl tracking-[0.25em] text-hex-glow">
          {roomCode}
        </div>
        <div className="mt-1">
          <CopyCode code={roomCode} />
        </div>
        <p className="text-sm text-[color:var(--color-parchment-dim)] font-body italic">
          Condividi queste 4 rune con gli altri iniziati
        </p>
      </div>

      <div className="grimoire-panel w-full max-w-md p-6">
        <p className="text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)] mb-4 text-center">
          Anime nel cerchio — {players.length}
        </p>
        <ul className="flex flex-col gap-2">
          {players.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[color:var(--color-abyss)]/60"
            >
              <span className="text-2xl">{p.avatar}</span>
              <span className="font-body text-lg text-[color:var(--color-parchment)]">
                {p.name}
                {p.id === myId && (
                  <span className="text-[color:var(--color-parchment-dim)] text-sm"> (tu)</span>
                )}
              </span>
              {p.id === state.hostId && (
                <span className="ml-auto text-xs uppercase tracking-widest text-hex-glow">
                  Officiante{!hostPlays ? ' (non gioca)' : ''}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {isHost && (
        <div className="grimoire-panel w-full max-w-md p-5 flex flex-col gap-3">
          <p className="text-sm font-body text-center text-[color:var(--color-parchment)]">
            Giochi anche tu, o fai solo l'Officiante?
          </p>
          <div className="flex gap-2">
            <button
              className={`sigil-btn flex-1 ${hostPlays ? '!border-[color:var(--color-hex)] text-hex-glow' : ''}`}
              onClick={() => setHostPlays(true)}
            >
              🎭 Gioco anch'io
            </button>
            <button
              className={`sigil-btn flex-1 ${!hostPlays ? '!border-[color:var(--color-hex)] text-hex-glow' : ''}`}
              onClick={() => setHostPlays(false)}
            >
              👁 Solo Officiante
            </button>
          </div>
          {!hostPlays && (
            <p className="text-xs text-center text-[color:var(--color-parchment-dim)] italic">
              Avrai una dashboard per tenere tutto sotto controllo: maledizioni, punti, azione in corso. Giudichi tu ogni azione e ogni denuncia; gli altri possono solo denunciare.
            </p>
          )}
        </div>
      )}

      {isHost ? (
        <button
          className="sigil-btn text-xl"
          disabled={!canStart}
          onClick={() => onStart(hostPlays)}
        >
          🔮 Dai inizio al rito
        </button>
      ) : (
        <p className="text-[color:var(--color-parchment-dim)] italic font-body rune-pulse">
          In attesa che l’Officiante apra il grimorio…
        </p>
      )}
      {isHost && !canStart && (
        <p className="text-xs text-[color:var(--color-parchment-dim)] -mt-4">
          {hostPlays
            ? 'Serve almeno un’altra anima per cominciare.'
            : 'Servono almeno 2 anime che giocano (oltre a te).'}
        </p>
      )}
    </div>
  )
}
