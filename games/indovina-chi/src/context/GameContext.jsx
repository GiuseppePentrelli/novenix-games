import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { usePeerConnection } from '../hooks/usePeerConnection'
import { useCpuConnection } from '../hooks/useCpuConnection'
import { gameReducer, createInitialState, PHASE } from './gameReducer'
import { deriveQuestions } from '../lib/questions'
import characters from '../data/characters.json'

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [mode, setMode] = useState(null) // 'multiplayer' | 'singleplayer'
  const realPeer = usePeerConnection()
  const cpu = useCpuConnection()
  const peer = mode === 'singleplayer' ? cpu : realPeer
  const [state, dispatch] = useReducer(gameReducer, characters, createInitialState)

  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  const charactersById = useMemo(() => Object.fromEntries(characters.map((c) => [c.id, c])), [])
  const questions = useMemo(() => deriveQuestions(characters), [])

  const handleIncoming = useCallback(
    (message) => {
      const current = stateRef.current
      switch (message.type) {
        case 'PLAYER_READY':
          dispatch({ type: 'OPPONENT_READY' })
          break
        case 'GAME_START':
          dispatch({
            type: 'START_PLAYING',
            payload: { turn: message.payload.firstTurn === 'guest' ? 'me' : 'opponent' },
          })
          break
        case 'QUESTION':
          dispatch({ type: 'RECEIVE_QUESTION', payload: { question: message.payload } })
          break
        case 'ANSWER':
          dispatch({ type: 'RECEIVE_ANSWER', payload: message.payload })
          break
        case 'GUESS': {
          const { characterId, characterName } = message.payload
          const correct = current.mySecret?.id === characterId
          // Don't resolve the outcome yet: show it to me as a popup and wait
          // for confirmIncomingGuess (below) so the player can't be denied
          // the "is it really my character?" beat — but the true/false
          // buttons are gated by `correct`, so there's no way to lie.
          dispatch({ type: 'INCOMING_GUESS', payload: { characterId, characterName, correct } })
          break
        }
        case 'GUESS_RESULT':
          dispatch({ type: 'RECEIVE_GUESS_RESULT', payload: message.payload })
          break
        case 'TURN_TIMEOUT':
          dispatch({ type: 'RECEIVE_TIMEOUT', payload: message.payload })
          break
        case 'REMATCH_REQUEST':
          dispatch({ type: 'ENTER_PICKING' })
          break
        case 'LEAVE':
          dispatch({ type: 'OPPONENT_LEFT' })
          break
        default:
          break
      }
    },
    [peer.send],
  )

  useEffect(() => {
    const unsubscribe = peer.onMessage(handleIncoming)
    return unsubscribe
  }, [peer.onMessage, handleIncoming])

  // Both peers enter the picking phase as soon as the connection is up.
  useEffect(() => {
    if (peer.status === 'connected' && state.phase === PHASE.LOBBY) {
      dispatch({ type: 'ENTER_PICKING' })
    }
  }, [peer.status, state.phase])

  // The host is the sole authority for turn order: once both players have
  // confirmed their secret, the host flips a coin and tells the guest.
  useEffect(() => {
    if (peer.isHost && state.phase === PHASE.PICKING && state.myReady && state.opponentReady) {
      const firstTurn = Math.random() < 0.5 ? 'host' : 'guest'
      dispatch({ type: 'START_PLAYING', payload: { turn: firstTurn === 'host' ? 'me' : 'opponent' } })
      peer.send({ type: 'GAME_START', payload: { firstTurn } })
    }
  }, [peer.isHost, peer.send, state.phase, state.myReady, state.opponentReady])

  useEffect(() => {
    if (
      peer.status === 'disconnected' &&
      stateRef.current.phase !== PHASE.ENDED &&
      stateRef.current.phase !== PHASE.LOBBY
    ) {
      dispatch({ type: 'OPPONENT_LEFT' })
    }
  }, [peer.status])

  // Resolves a guess made against my secret. `pending.correct` was computed
  // the moment the guess arrived (from my own secret, which I can't lie
  // about), so confirming just reveals what the game already knows.
  const confirmIncomingGuess = useCallback(() => {
    const pending = stateRef.current.pendingIncomingGuess
    if (!pending) return
    dispatch({ type: 'CONFIRM_GUESS' })
    peer.send({ type: 'GUESS_RESULT', payload: { correct: pending.correct, opponentSecret: stateRef.current.mySecret } })
  }, [peer.send])

  const handleTimeout = useCallback(() => {
    if (stateRef.current.pendingIncomingGuess) {
      confirmIncomingGuess()
      return
    }
    const pending = stateRef.current.pendingIncomingQuestion
    dispatch({ type: 'SELF_TIMEOUT' })
    peer.send({ type: 'TURN_TIMEOUT', payload: { questionId: pending?.id ?? null } })
  }, [peer.send, confirmIncomingGuess])

  // Runs the countdown for whichever window is currently "mine" (answering a
  // pending question, or asking/guessing). If it elapses, the turn is
  // forfeited and passed to the opponent, on both sides of the wire.
  useEffect(() => {
    if (state.phase !== PHASE.PLAYING || state.turn !== 'me' || !state.turnDeadline) return undefined
    const delay = state.turnDeadline - Date.now()
    if (delay <= 0) {
      handleTimeout()
      return undefined
    }
    const id = setTimeout(handleTimeout, delay)
    return () => clearTimeout(id)
  }, [state.phase, state.turn, state.turnDeadline, handleTimeout])

  const confirmSecret = useCallback(
    (characterId) => {
      const character = charactersById[characterId]
      dispatch({ type: 'CONFIRM_SECRET', payload: { character } })
      peer.send({ type: 'PLAYER_READY', payload: {} })
    },
    [charactersById, peer.send],
  )

  const askQuestion = useCallback(
    (question) => {
      dispatch({ type: 'ASK_QUESTION', payload: { question } })
      peer.send({ type: 'QUESTION', payload: question })
    },
    [peer.send],
  )

  const answerIncomingQuestion = useCallback(
    (answer) => {
      const pending = stateRef.current.pendingIncomingQuestion
      if (!pending) return
      dispatch({ type: 'ANSWER_SENT', payload: { questionId: pending.id, answer } })
      peer.send({ type: 'ANSWER', payload: { questionId: pending.id, answer } })
    },
    [peer.send],
  )

  const submitGuess = useCallback(
    (characterId) => {
      const character = charactersById[characterId]
      dispatch({ type: 'SUBMIT_GUESS', payload: { characterId, characterName: character.nome } })
      peer.send({ type: 'GUESS', payload: { characterId, characterName: character.nome } })
    },
    [charactersById, peer.send],
  )

  const requestRematch = useCallback(() => {
    dispatch({ type: 'ENTER_PICKING' })
    peer.send({ type: 'REMATCH_REQUEST', payload: {} })
  }, [peer.send])

  const leaveGame = useCallback(() => {
    peer.send({ type: 'LEAVE', payload: {} })
    peer.disconnect()
  }, [peer.send, peer.disconnect])

  const toggleEliminated = useCallback((characterId) => {
    dispatch({ type: 'TOGGLE_ELIMINATED', payload: { characterId } })
  }, [])

  const hostRoom = useCallback(() => {
    setMode('multiplayer')
    realPeer.hostRoom()
  }, [realPeer.hostRoom])

  const joinRoom = useCallback(
    (code) => {
      setMode('multiplayer')
      realPeer.joinRoom(code)
    },
    [realPeer.joinRoom],
  )

  const startSinglePlayer = useCallback(() => {
    setMode('singleplayer')
    cpu.hostRoom()
  }, [cpu.hostRoom])

  const value = {
    state,
    questions,
    characters,
    mode,
    peerStatus: peer.status,
    peerError: peer.error,
    isHost: peer.isHost,
    roomCode: peer.roomCode,
    hostRoom,
    joinRoom,
    startSinglePlayer,
    disconnect: peer.disconnect,
    confirmSecret,
    askQuestion,
    answerIncomingQuestion,
    submitGuess,
    confirmIncomingGuess,
    requestRematch,
    leaveGame,
    toggleEliminated,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
