import { GameProvider, useGame } from './context/GameContext'
import LobbyView from './views/LobbyView'
import PickCharacterView from './views/PickCharacterView'
import GameView from './views/GameView'
import EndView from './views/EndView'

function Screen() {
  const { peerStatus, state } = useGame()

  if (peerStatus !== 'connected' || state.phase === 'lobby') {
    return <LobbyView />
  }

  if (state.phase === 'picking') {
    return <PickCharacterView />
  }

  if (state.phase === 'ended') {
    return <EndView />
  }

  return <GameView />
}

export default function App() {
  return (
    <GameProvider>
      <Screen />
    </GameProvider>
  )
}
