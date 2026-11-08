import { useEffect, useRef, useState } from 'react'
import { usePeerRoom } from './net/usePeerRoom.js'
import Lobby from './components/Lobby.jsx'
import WaitingRoom from './components/WaitingRoom.jsx'
import Table from './components/Table.jsx'
import HostDashboard from './components/HostDashboard.jsx'
import TurnOrderReveal from './components/TurnOrderReveal.jsx'
import DemoView from './components/DemoView.jsx'

export default function App() {
  // Anteprima attivabile da bottone o con ?demo nell'URL.
  const [demo, setDemo] = useState(
    () => new URLSearchParams(window.location.search).has('demo')
  )
  const room = usePeerRoom()
  const { status, error, myId, roomCode, isHost, state, hostRoom, joinRoom, leave, dispatch } = room

  // Mostra la rivelazione del dado una sola volta, appena si passa
  // da 'lobby' a 'playing' (inizio vero e proprio della partita).
  const [showReveal, setShowReveal] = useState(false)
  const prevPhaseRef = useRef(null)
  useEffect(() => {
    if (prevPhaseRef.current === 'lobby' && state?.phase === 'playing') {
      setShowReveal(true)
    }
    prevPhaseRef.current = state?.phase
  }, [state?.phase])

  if (demo) return <DemoView onExit={() => setDemo(false)} />

  // Non ancora nel rito: schermata di connessione.
  if (!state || status !== 'connected') {
    return (
      <Lobby
        status={status}
        error={error}
        onHost={hostRoom}
        onJoin={joinRoom}
        onDemo={() => setDemo(true)}
      />
    )
  }

  if (state.phase === 'lobby') {
    return (
      <WaitingRoom
        state={state}
        myId={myId}
        roomCode={roomCode}
        isHost={isHost}
        onStart={(hostPlays) => dispatch({ type: 'START_GAME', by: myId, hostPlays })}
        onLeave={leave}
      />
    )
  }

  if (showReveal) {
    return (
      <TurnOrderReveal
        turnOrder={state.turnOrder}
        rolls={state.rolls}
        players={state.players}
        onDone={() => setShowReveal(false)}
      />
    )
  }

  if (isHost && !state.hostPlays) {
    return (
      <HostDashboard
        state={state}
        myId={myId}
        roomCode={roomCode}
        onDispatch={dispatch}
        onLeave={leave}
      />
    )
  }

  return (
    <Table
      state={state}
      myId={myId}
      roomCode={roomCode}
      isHost={isHost}
      onDispatch={dispatch}
      onLeave={leave}
    />
  )
}
