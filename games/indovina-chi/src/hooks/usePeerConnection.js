import { useCallback, useEffect, useRef, useState } from 'react'
import Peer from 'peerjs'
import { generateRoomCode, roomCodeToPeerId } from '../lib/peer'

const JOIN_TIMEOUT_MS = 10000
const MAX_HOST_RETRIES = 5

// Wraps PeerJS in an idiomatic React hook. The Peer/DataConnection instances
// live in refs (they're mutable, non-serializable objects and must not be
// pushed into React state directly); everything the UI needs to react to is
// exposed as plain state. Incoming messages are fanned out through a
// subscriber list rather than "last message" state, so no message is ever
// dropped if two arrive in the same tick.
export function usePeerConnection() {
  const [status, setStatus] = useState('idle')
  const [roomCode, setRoomCode] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [error, setError] = useState('')

  const peerRef = useRef(null)
  const connRef = useRef(null)
  const listenersRef = useRef(new Set())
  const joinTimeoutRef = useRef(null)

  const clearJoinTimeout = () => {
    if (joinTimeoutRef.current) {
      clearTimeout(joinTimeoutRef.current)
      joinTimeoutRef.current = null
    }
  }

  const attachConnHandlers = useCallback((conn) => {
    connRef.current = conn
    conn.on('open', () => {
      clearJoinTimeout()
      setStatus('connected')
    })
    conn.on('data', (data) => {
      listenersRef.current.forEach((handler) => handler(data))
    })
    conn.on('close', () => {
      setStatus('disconnected')
    })
    conn.on('error', () => {
      setStatus('disconnected')
    })
  }, [])

  const hostRoom = useCallback(() => {
    setIsHost(true)
    setError('')
    setStatus('connecting')

    let attempts = 0

    const tryCreate = () => {
      attempts += 1
      const code = generateRoomCode()
      const peer = new Peer(roomCodeToPeerId(code))
      peerRef.current = peer

      peer.on('open', () => {
        setRoomCode(code)
        setStatus('waiting-for-peer')
      })

      peer.on('connection', (conn) => {
        attachConnHandlers(conn)
      })

      peer.on('error', (err) => {
        if (err.type === 'unavailable-id' && attempts < MAX_HOST_RETRIES) {
          peer.destroy()
          tryCreate()
          return
        }
        setStatus('error')
        setError('Impossibile creare la stanza. Riprova.')
      })
    }

    tryCreate()
  }, [attachConnHandlers])

  const joinRoom = useCallback(
    (code) => {
      setIsHost(false)
      setError('')
      setStatus('connecting')

      const peer = new Peer()
      peerRef.current = peer

      peer.on('open', () => {
        const conn = peer.connect(roomCodeToPeerId(code), { reliable: true })
        attachConnHandlers(conn)

        joinTimeoutRef.current = setTimeout(() => {
          setStatus('error')
          setError('Codice stanza non valido o host non raggiungibile.')
          peer.destroy()
        }, JOIN_TIMEOUT_MS)
      })

      peer.on('error', (err) => {
        clearJoinTimeout()
        if (err.type === 'peer-unavailable') {
          setStatus('error')
          setError('Nessuna stanza trovata con questo codice.')
        } else {
          setStatus('error')
          setError('Errore di connessione. Riprova.')
        }
      })
    },
    [attachConnHandlers],
  )

  const send = useCallback((message) => {
    connRef.current?.send(message)
  }, [])

  const onMessage = useCallback((handler) => {
    listenersRef.current.add(handler)
    return () => listenersRef.current.delete(handler)
  }, [])

  const disconnect = useCallback(() => {
    clearJoinTimeout()
    connRef.current?.close()
    if (peerRef.current && !peerRef.current.destroyed) {
      peerRef.current.destroy()
    }
    connRef.current = null
    peerRef.current = null
    setStatus('idle')
  }, [])

  useEffect(() => {
    return () => {
      clearJoinTimeout()
      if (peerRef.current && !peerRef.current.destroyed) {
        peerRef.current.destroy()
      }
    }
  }, [])

  return {
    status,
    roomCode,
    isHost,
    error,
    hostRoom,
    joinRoom,
    send,
    onMessage,
    disconnect,
  }
}
