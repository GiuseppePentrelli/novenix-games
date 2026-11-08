import { useCallback, useEffect, useRef, useState } from 'react'
import Peer from 'peerjs'
import { generateRoomCode, roomCodeToPeerId } from '../lib/peer'

const JOIN_TIMEOUT_MS = 10000
const MAX_HOST_RETRIES = 5

// Extends the 1:1 usePeerConnection pattern from indovina_chi to a star
// topology: the host holds one DataConnection per guest (in a Map, keyed by
// peer id) and `send()` broadcasts to all of them; a guest holds a single
// DataConnection to the host and `send()` writes to just that one. Both
// roles are exposed behind the same API so the game layer above doesn't
// need to know which side of the star it's on.
export function usePeerConnection() {
  const [status, setStatus] = useState('idle') // idle | connecting | waiting-for-peer | connected | disconnected | error
  const [roomCode, setRoomCode] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [myId, setMyId] = useState('')
  const [error, setError] = useState('')

  const peerRef = useRef(null)
  const connsRef = useRef(new Map()) // guest peerId -> DataConnection (host only)
  const connRef = useRef(null) // connection to host (guest only)
  const listenersRef = useRef(new Set()) // handler(data, fromId)
  const leaveListenersRef = useRef(new Set()) // handler(peerId)
  const joinTimeoutRef = useRef(null)

  const clearJoinTimeout = () => {
    if (joinTimeoutRef.current) {
      clearTimeout(joinTimeoutRef.current)
      joinTimeoutRef.current = null
    }
  }

  const attachGuestHandlers = useCallback((conn) => {
    connsRef.current.set(conn.peer, conn)
    conn.on('open', () => {
      setStatus('connected')
    })
    conn.on('data', (data) => {
      listenersRef.current.forEach((handler) => handler(data, conn.peer))
    })
    const onGone = () => {
      if (connsRef.current.get(conn.peer) === conn) {
        connsRef.current.delete(conn.peer)
        leaveListenersRef.current.forEach((handler) => handler(conn.peer))
      }
    }
    conn.on('close', onGone)
    conn.on('error', onGone)
  }, [])

  const attachHostHandlers = useCallback((conn) => {
    connRef.current = conn
    conn.on('open', () => {
      clearJoinTimeout()
      setStatus('connected')
    })
    conn.on('data', (data) => {
      listenersRef.current.forEach((handler) => handler(data, conn.peer))
    })
    conn.on('close', () => setStatus('disconnected'))
    conn.on('error', () => setStatus('disconnected'))
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

      peer.on('open', (id) => {
        setRoomCode(code)
        setMyId(id)
        setStatus('waiting-for-peer')
      })

      peer.on('connection', (conn) => {
        attachGuestHandlers(conn)
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
  }, [attachGuestHandlers])

  const joinRoom = useCallback(
    (code) => {
      setIsHost(false)
      setError('')
      setStatus('connecting')
      setRoomCode(code.trim().toUpperCase())

      const peer = new Peer()
      peerRef.current = peer

      peer.on('open', (id) => {
        setMyId(id)
        const conn = peer.connect(roomCodeToPeerId(code), { reliable: true })
        attachHostHandlers(conn)

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
    [attachHostHandlers],
  )

  // Host: broadcasts to every connected guest. Guest: sends to the host.
  const send = useCallback(
    (message) => {
      if (isHost) {
        connsRef.current.forEach((conn) => {
          if (conn.open) conn.send(message)
        })
      } else {
        connRef.current?.send(message)
      }
    },
    [isHost],
  )

  const onMessage = useCallback((handler) => {
    listenersRef.current.add(handler)
    return () => listenersRef.current.delete(handler)
  }, [])

  const onPeerLeave = useCallback((handler) => {
    leaveListenersRef.current.add(handler)
    return () => leaveListenersRef.current.delete(handler)
  }, [])

  const disconnect = useCallback(() => {
    clearJoinTimeout()
    connsRef.current.forEach((conn) => conn.close())
    connsRef.current.clear()
    connRef.current?.close()
    connRef.current = null
    if (peerRef.current && !peerRef.current.destroyed) {
      peerRef.current.destroy()
    }
    peerRef.current = null
    setStatus('idle')
    setRoomCode('')
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
    myId,
    error,
    hostRoom,
    joinRoom,
    send,
    onMessage,
    onPeerLeave,
    disconnect,
  }
}
