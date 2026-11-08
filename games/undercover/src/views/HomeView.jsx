import { useState } from 'react'
import { useGame } from '../context/GameContext.jsx'

export default function HomeView() {
  const { createRoom, joinRoom, connectionStatus, connectionError } = useGame()
  const [mode, setMode] = useState('crea')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  const busy = connectionStatus === 'connecting'
  const trimmedName = name.trim()

  const handleCreate = () => {
    if (!trimmedName) return
    createRoom(trimmedName)
  }

  const handleJoin = (e) => {
    e.preventDefault()
    if (!trimmedName || code.trim().length < 4) return
    joinRoom(code.trim(), trimmedName)
  }

  return (
    <div className="screen">
      <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
        <span className="eyebrow">Fascicolo N&deg; UC &mdash; nuova indagine</span>
        <h1 style={{ fontSize: 'clamp(3rem, 16vw, 4rem)', lineHeight: 0.9, margin: '0.4rem 0 1rem' }}>
          Under
          <br />
          Cover
        </h1>
        <p style={{ color: 'var(--ink-muted)', maxWidth: '32ch' }}>
          Un infiltrato in mezzo a voi. Radunate la squadra sullo stesso telefono per iniziare.
        </p>
      </div>

      <div className="field" style={{ marginBottom: '1.2rem' }}>
        <label htmlFor="player-name">Il tuo nome</label>
        <input
          id="player-name"
          type="text"
          placeholder="Come ti chiamano gli altri agenti?"
          value={name}
          maxLength={18}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="card" style={{ padding: '1.5rem 1.4rem', border: '2px solid var(--stamp)' }}>
        <span className="tab-label" style={{ marginBottom: '0.9rem', display: 'inline-block' }}>
          Azione richiesta
        </span>
        <div className="tabs" role="tablist" style={{ marginBottom: '1.1rem' }}>
          <button type="button" role="tab" aria-selected={mode === 'crea'} onClick={() => setMode('crea')}>
            Crea stanza
          </button>
          <button type="button" role="tab" aria-selected={mode === 'unisciti'} onClick={() => setMode('unisciti')}>
            Ho un codice
          </button>
        </div>

        {mode === 'crea' ? (
          <div>
            <p className="notice" style={{ marginBottom: '1.1rem' }}>
              Diventi il game master: genera un codice a quattro lettere e condividilo con la squadra.
            </p>
            <button
              className="btn btn-primary btn-lg"
              type="button"
              disabled={!trimmedName || busy}
              onClick={handleCreate}
            >
              {busy ? 'Apertura in corso…' : 'Apri una stanza →'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleJoin}>
            <p className="notice" style={{ marginBottom: '1rem' }}>
              Inserisci il codice ricevuto da chi ospita.
            </p>
            <input
              type="text"
              inputMode="text"
              maxLength={4}
              placeholder="CODICE"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              style={{
                width: '100%',
                fontFamily: "'Big Shoulders Stencil', sans-serif",
                fontSize: '2rem',
                letterSpacing: '0.5em',
                textAlign: 'center',
                padding: '0.5em 0 0.5em 0.5em',
                background: 'var(--card)',
                border: '1px solid var(--card-line)',
                color: 'var(--ink)',
                marginBottom: '1.1rem',
              }}
            />
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={!trimmedName || code.trim().length < 4 || busy}
            >
              {busy ? 'Ingresso in corso…' : 'Entra nella stanza'}
            </button>
          </form>
        )}

        {connectionStatus === 'error' && connectionError ? (
          <p className="notice" style={{ marginTop: '1rem' }}>
            <b>Errore &mdash; </b>
            {connectionError}
          </p>
        ) : null}
      </div>
    </div>
  )
}
