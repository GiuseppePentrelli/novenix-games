import { useEffect, useRef, useState } from 'react'
import { useGame } from '../context/GameContext'

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const input = document.createElement('input')
      input.value = text
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      return true
    } catch {
      return false
    }
  }
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={async () => {
        const ok = await copyText(text)
        if (ok) {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }
      }}
    >
      {copied ? 'Copiato!' : label}
    </button>
  )
}

const MOSAIC_TILE_COUNT = 96

export default function LobbyView() {
  const { peerStatus, peerError, roomCode, hostRoom, joinRoom, startSinglePlayer, characters } = useGame()
  const [screenMode, setScreenMode] = useState('choice')
  const [joinCode, setJoinCode] = useState('')
  const autoJoinedRef = useRef(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const roomParam = params.get('room')
    if (roomParam && !autoJoinedRef.current) {
      autoJoinedRef.current = true
      setScreenMode('join')
      setJoinCode(roomParam.toUpperCase())
      joinRoom(roomParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isBusy = peerStatus === 'connecting' || peerStatus === 'waiting-for-peer'

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden p-4">
      {/* Background collage of the game's own character portraits, like a box cover */}
      <div className="absolute inset-0 grid grid-cols-6 gap-1 sm:grid-cols-8 md:grid-cols-10">
        {Array.from({ length: MOSAIC_TILE_COUNT }).map((_, i) => {
          const character = characters[i % characters.length]
          return (
            <img
              key={i}
              src={character.img}
              alt=""
              aria-hidden="true"
              className="aspect-square w-full object-cover grayscale"
            />
          )
        })}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/80 to-accent/70" />

      <div className="relative w-full max-w-md rounded-[2rem] bg-gradient-to-br from-primary via-accent to-primary p-1.5 shadow-popup">
        <div className="rounded-[1.85rem] bg-white/95 p-6 backdrop-blur sm:p-8">
        <div className="flex flex-col items-center gap-2">
          <h1 className="flex items-center gap-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span aria-hidden="true">🔍</span>
            <span className="text-primary [text-shadow:3px_3px_0_rgba(124,58,237,0.18)]">Indovina</span>
            <span className="inline-block -rotate-6 rounded-2xl bg-accent px-3 py-1 text-white shadow-card">
              Chi?
            </span>
          </h1>
          <div className="h-1.5 w-28 rounded-full bg-gradient-to-r from-primary via-accent to-primary" />
        </div>
        <p className="mt-3 text-center text-sm text-gray-500">Sfida un amico in tempo reale, oppure gioca contro il PC.</p>

        {screenMode === 'choice' && (
          <div className="mt-8 flex flex-col gap-3">
            <button type="button" className="btn-primary" onClick={() => setScreenMode('multiplayer')}>
              🎮 Gioca Multiplayer
            </button>
            <button type="button" className="btn-secondary" onClick={startSinglePlayer}>
              🤖 Gioca Singolo Giocatore
            </button>
          </div>
        )}

        {screenMode === 'multiplayer' && (
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setScreenMode('create')
                hostRoom()
              }}
            >
              🏠 Crea Stanza
            </button>
            <button type="button" className="btn-secondary" onClick={() => setScreenMode('join')}>
              🔑 Entra in una Stanza
            </button>
            <button type="button" className="text-sm text-gray-400 underline" onClick={() => setScreenMode('choice')}>
              Torna indietro
            </button>
          </div>
        )}

        {screenMode === 'create' && (
          <div className="mt-8 flex flex-col items-center gap-4">
            {!roomCode && <p className="text-gray-500">Creazione stanza in corso...</p>}
            {roomCode && (
              <>
                <p className="text-sm text-gray-500">Condividi questo codice con il tuo avversario:</p>
                <p className="rounded-2xl bg-primary/10 px-6 py-3 text-3xl font-extrabold tracking-widest text-primary">
                  {roomCode}
                </p>
                <CopyButton text={roomCode} label="Copia Codice" />
                <p className="mt-2 animate-pulse text-sm font-semibold text-accent-dark">
                  In attesa di un avversario...
                </p>
              </>
            )}
            <button type="button" className="text-sm text-gray-400 underline" onClick={() => setScreenMode('multiplayer')}>
              Torna indietro
            </button>
          </div>
        )}

        {screenMode === 'join' && (
          <div className="mt-8 flex flex-col gap-4">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Codice stanza"
              maxLength={20}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-center text-xl font-extrabold tracking-widest"
            />
            <button
              type="button"
              className="btn-primary"
              disabled={!joinCode || isBusy}
              onClick={() => joinRoom(joinCode)}
            >
              {isBusy ? 'Connessione in corso...' : 'Entra nella Stanza'}
            </button>
            {peerError && <p className="text-center text-sm font-semibold text-danger">{peerError}</p>}
            <button type="button" className="text-sm text-gray-400 underline" onClick={() => setScreenMode('multiplayer')}>
              Torna indietro
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
