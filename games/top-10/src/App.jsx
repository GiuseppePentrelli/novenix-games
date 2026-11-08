import { useMemo, useState } from 'react'
import SetupScreen from './components/SetupScreen.jsx'
import HostView from './components/HostView.jsx'
import ClassicView from './components/ClassicView.jsx'
import PlayerView from './components/PlayerView.jsx'
import { makeInitialState } from './hooks/useGameEngine.js'
import { loadState } from './utils/storage.js'

export default function App() {
  const isPlayerWindow = useMemo(
    () => new URLSearchParams(window.location.search).get('view') === 'player',
    [],
  )

  const savedGame = useMemo(() => {
    const s = loadState()
    return s && s.phase === 'playing' ? s : null
  }, [])

  const [gameState, setGameState] = useState(null)

  if (isPlayerWindow) {
    return <PlayerView />
  }

  if (!gameState) {
    return (
      <SetupScreen
        hasSavedGame={!!savedGame}
        onStart={(config) => setGameState(makeInitialState(config))}
        onContinue={() => setGameState(savedGame)}
      />
    )
  }

  return gameState.mode === 'host' ? (
    <HostView initialState={gameState} />
  ) : (
    <ClassicView initialState={gameState} />
  )
}
