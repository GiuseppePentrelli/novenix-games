import { useEffect, useState } from 'react'
import { useGame } from './context/GameContext.jsx'
import { PHASE } from './context/gameReducer.js'
import HomeView from './views/HomeView.jsx'
import LobbyView from './views/LobbyView.jsx'
import RoleView from './views/RoleView.jsx'
import PlayView from './views/PlayView.jsx'
import AccusationView from './views/AccusationView.jsx'
import ResultView from './views/ResultView.jsx'
import RulesView from './views/RulesView.jsx'

function Screen() {
  const { connectionStatus, state, disconnect } = useGame()
  const [hasSeenRole, setHasSeenRole] = useState(false)

  // Every new round (first game or a rematch) hides the previous card again.
  useEffect(() => {
    setHasSeenRole(false)
  }, [state.round?.startedAt])

  if (connectionStatus === 'disconnected') {
    return (
      <div className="screen" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <span className="eyebrow">Connessione persa</span>
        <h2 style={{ margin: '0.6rem 0 1rem' }}>Segnale interrotto</h2>
        <p className="notice" style={{ marginBottom: '1.5rem' }}>
          La connessione con la stanza si è interrotta.
        </p>
        <button className="btn btn-primary" type="button" onClick={disconnect}>
          Torna alla home
        </button>
      </div>
    )
  }

  const inRoom = connectionStatus === 'waiting-for-peer' || connectionStatus === 'connected'
  if (!inRoom) return <HomeView />

  switch (state.phase) {
    case PHASE.LOBBY:
      return <LobbyView />
    case PHASE.PLAYING:
      return hasSeenRole ? <PlayView /> : <RoleView onContinue={() => setHasSeenRole(true)} />
    case PHASE.ACCUSATION:
    case PHASE.SPY_GUESS:
      return <AccusationView />
    case PHASE.RESULTS:
      return <ResultView />
    default:
      return <LobbyView />
  }
}

export default function App() {
  const [showRules, setShowRules] = useState(false)

  return (
    <>
      <Screen />
      <button
        type="button"
        onClick={() => setShowRules(true)}
        aria-label="Apri le regole del gioco"
        style={{
          position: 'fixed',
          top: '0.9rem',
          right: '0.9rem',
          zIndex: 90,
          width: '2.4rem',
          height: '2.4rem',
          borderRadius: '50%',
          border: '2px solid var(--stamp)',
          background: 'var(--bg-soft)',
          color: 'var(--stamp)',
          fontFamily: "'Big Shoulders Stencil', sans-serif",
          fontSize: '1.2rem',
          cursor: 'pointer',
        }}
      >
        ?
      </button>
      {showRules ? <RulesView onClose={() => setShowRules(false)} /> : null}
    </>
  )
}
