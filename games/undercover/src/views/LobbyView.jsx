import { useGame } from '../context/GameContext.jsx'

const TIMER_OPTIONS = [5, 8, 10, 15]

export default function LobbyView() {
  const { state, isHost, myId, roomCode, dispatchGameAction, disconnect } = useGame()
  const { players, settings } = state
  const canStart = players.length >= 3

  return (
    <div className="screen">
      <div style={{ marginTop: '2rem', marginBottom: '1.5rem' }}>
        <span className="eyebrow">Stanza aperta</span>
        <h2 style={{ fontSize: '2rem', margin: '0.3rem 0' }}>Sala d'attesa</h2>
        <p className="notice">Condividi il codice: chi ce l'ha entra dal proprio telefono.</p>
      </div>

      <div className="card" style={{ padding: '1.4rem', textAlign: 'center', marginBottom: '1.4rem' }}>
        <span className="tab-label">Codice stanza</span>
        <div
          style={{
            fontFamily: "'Big Shoulders Stencil', sans-serif",
            fontSize: '3rem',
            letterSpacing: '0.25em',
            marginTop: '0.6rem',
            color: 'var(--stamp)',
          }}
        >
          {roomCode}
        </div>
      </div>

      <div className="card" style={{ padding: '1.2rem 1.4rem', marginBottom: '1.4rem' }}>
        <span className="tab-label" style={{ marginBottom: '0.8rem', display: 'inline-block' }}>
          Squadra ({players.length})
        </span>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {players.map((p) => (
            <li
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px dashed var(--card-line)',
                paddingBottom: '0.5rem',
              }}
            >
              <span>
                {p.name}
                {p.id === myId ? ' (tu)' : ''}
              </span>
              {p.isHost ? <span className="stamp" style={{ fontSize: '0.6rem', padding: '0.25em 0.5em' }}>Host</span> : null}
            </li>
          ))}
        </ul>
      </div>

      {isHost ? (
        <div className="card" style={{ padding: '1.2rem 1.4rem', marginBottom: '1.4rem' }}>
          <span className="tab-label" style={{ marginBottom: '0.8rem', display: 'inline-block' }}>
            Durata indagine
          </span>
          <div className="tabs" role="tablist">
            {TIMER_OPTIONS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                role="tab"
                aria-selected={settings.timerMinutes === minutes}
                onClick={() => dispatchGameAction({ type: 'SET_TIMER', payload: { minutes } })}
              >
                {minutes}'
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {isHost ? (
          <>
            <button
              className="btn btn-primary btn-lg"
              type="button"
              disabled={!canStart}
              onClick={() => dispatchGameAction({ type: 'START_GAME', payload: {} })}
            >
              {canStart ? 'Avvia indagine →' : `Servono almeno 3 agenti (${players.length}/3)`}
            </button>
          </>
        ) : (
          <p className="notice" style={{ textAlign: 'center' }}>
            In attesa che l'host avvii la partita
            <span className="spinner-dot" style={{ marginLeft: '0.4em' }} />
          </p>
        )}
        <button className="btn btn-ghost" type="button" onClick={disconnect}>
          Esci dalla stanza
        </button>
      </div>
    </div>
  )
}
