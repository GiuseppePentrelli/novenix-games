import { createContext, useCallback, useContext, useEffect, useReducer, useRef, useState } from 'react'
import { usePeerConnection } from '../hooks/usePeerConnection'
import { gameReducer, initialState, PHASE } from './gameReducer'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const peer = usePeerConnection()
  const [hostState, dispatch] = useReducer(gameReducer, initialState)
  const [guestState, setGuestState] = useState(initialState)
  const state = peer.isHost ? hostState : guestState

  const pendingNameRef = useRef('')
  const selfJoinedRef = useRef(false)
  const helloSentRef = useRef(false)

  // Host: broadcast the full state to every guest whenever it changes.
  useEffect(() => {
    if (!peer.isHost) return
    peer.send({ type: 'STATE', state: hostState })
  }, [peer, peer.isHost, hostState])

  // Host: once the room is up, add the host itself as the first player.
  useEffect(() => {
    if (!peer.isHost || selfJoinedRef.current) return
    if (peer.status === 'waiting-for-peer' && peer.myId) {
      selfJoinedRef.current = true
      dispatch({
        type: 'PLAYER_JOINED',
        payload: { id: peer.myId, name: pendingNameRef.current || 'Host', isHost: true },
      })
    }
  }, [peer.isHost, peer.status, peer.myId])

  // Guest: once connected to the host, introduce yourself.
  useEffect(() => {
    if (peer.isHost || helloSentRef.current) return
    if (peer.status === 'connected') {
      helloSentRef.current = true
      peer.send({ type: 'HELLO', name: pendingNameRef.current || 'Giocatore' })
    }
  }, [peer, peer.isHost, peer.status])

  // Incoming messages: host applies guest actions/introductions; guests
  // simply replace their local view with whatever state the host broadcasts.
  useEffect(() => {
    return peer.onMessage((data, fromId) => {
      if (peer.isHost) {
        if (data.type === 'HELLO') {
          dispatch({ type: 'PLAYER_JOINED', payload: { id: fromId, name: data.name, isHost: false } })
        } else if (data.type === 'ACTION') {
          dispatch(data.action)
        }
      } else if (data.type === 'STATE') {
        setGuestState(data.state)
      }
    })
  }, [peer])

  // Host: a guest's connection dropped, remove them from the room.
  useEffect(() => {
    if (!peer.isHost) return
    return peer.onPeerLeave((peerId) => {
      dispatch({ type: 'PLAYER_LEFT', payload: { id: peerId } })
    })
  }, [peer, peer.isHost])

  // Host: resolve the round when the shared timer runs out.
  useEffect(() => {
    if (!peer.isHost || state.phase !== PHASE.PLAYING || !state.round) return
    const check = () => {
      if (Date.now() >= state.round.endsAt) {
        dispatch({ type: 'TIME_EXPIRED', payload: {} })
      }
    }
    const id = setInterval(check, 1000)
    return () => clearInterval(id)
  }, [peer.isHost, state.phase, state.round])

  const createRoom = useCallback(
    (name) => {
      dispatch({ type: 'RESET' })
      pendingNameRef.current = name
      selfJoinedRef.current = false
      peer.hostRoom()
    },
    [peer],
  )

  const joinRoom = useCallback(
    (code, name) => {
      setGuestState(initialState)
      pendingNameRef.current = name
      helloSentRef.current = false
      peer.joinRoom(code)
    },
    [peer],
  )

  // Every gameplay action funnels through here: the host applies it to its
  // reducer directly, a guest ships it to the host to apply on their behalf.
  const dispatchGameAction = useCallback(
    (action) => {
      const withPlayer = {
        ...action,
        payload: { playerId: peer.myId, ...action.payload },
      }
      if (peer.isHost) {
        dispatch(withPlayer)
      } else {
        peer.send({ type: 'ACTION', action: withPlayer })
      }
    },
    [peer],
  )

  const me = state.players.find((p) => p.id === peer.myId) ?? null

  const value = {
    connectionStatus: peer.status,
    isHost: peer.isHost,
    myId: peer.myId,
    roomCode: peer.roomCode,
    connectionError: peer.error,
    createRoom,
    joinRoom,
    disconnect: peer.disconnect,
    state,
    me,
    dispatchGameAction,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}
