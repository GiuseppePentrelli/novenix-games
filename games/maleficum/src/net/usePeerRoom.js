// ============================================================
// MALEFICUM — usePeerRoom
// Topologia a stella host-autoritativa su PeerJS.
//  • L'host tiene lo stato ufficiale, applica le azioni col
//    reducer e ribroadcasta lo stato completo (SYNC).
//  • I guest si connettono all'host e gli inviano AZIONI.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import Peer from 'peerjs'
import { createInitialState, gameReducer } from '../game/state.js'

const PREFIX = 'mlfcm-'
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // niente caratteri ambigui

function randomCode(len = 4) {
  let s = ''
  for (let i = 0; i < len; i++)
    s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  return s
}

const codeToPeerId = (code) => PREFIX + code.trim().toUpperCase()

// STUN + TURN: senza TURN la connessione fallisce quando i due
// giocatori sono su reti/NAT diversi (il caso più comune di
// "l'host funziona ma nessuno riesce a entrare").
const PEER_OPTS = {
  debug: 1,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
      },
    ],
  },
}

const JOIN_TIMEOUT_MS = 15000

export function usePeerRoom() {
  const [status, setStatus] = useState('idle') // idle|hosting|joining|connected|error
  const [error, setError] = useState(null)
  const [myId, setMyId] = useState(null)
  const [roomCode, setRoomCode] = useState(null)
  const [isHost, setIsHost] = useState(false)
  const [state, setState] = useState(null)

  const peerRef = useRef(null)
  const connsRef = useRef(new Map()) // host: peerId -> DataConnection
  const hostConnRef = useRef(null) // guest: connessione verso l'host
  const stateRef = useRef(null) // specchio dello stato per le callback
  const isHostRef = useRef(false)
  const myNameRef = useRef('Anonimo')
  const joinTimerRef = useRef(null)

  const setBoth = useCallback((next) => {
    stateRef.current = next
    setState(next)
  }, [])

  // ---- HOST: applica azione + broadcast ----
  const hostApply = useCallback((action) => {
    const next = gameReducer(stateRef.current, action)
    setBoth(next)
    const payload = JSON.stringify({ t: 'SYNC', state: next })
    for (const conn of connsRef.current.values()) {
      if (conn.open) conn.send(payload)
    }
  }, [setBoth])

  // ---- Dispatch pubblico: host applica, guest inoltra ----
  const dispatch = useCallback((action) => {
    if (isHostRef.current) {
      hostApply(action)
    } else if (hostConnRef.current?.open) {
      hostConnRef.current.send(JSON.stringify({ t: 'ACTION', action }))
    }
  }, [hostApply])

  const teardown = useCallback(() => {
    clearTimeout(joinTimerRef.current)
    for (const conn of connsRef.current.values()) conn.close?.()
    connsRef.current.clear()
    hostConnRef.current?.close?.()
    hostConnRef.current = null
    peerRef.current?.destroy?.()
    peerRef.current = null
  }, [])

  // ---- Crea stanza (diventa host) ----
  const hostRoom = useCallback(
    (name) => {
      teardown()
      myNameRef.current = name || 'Oscuro Officiante'
      const code = randomCode()
      const peer = new Peer(codeToPeerId(code), PEER_OPTS)
      peerRef.current = peer
      isHostRef.current = true
      setIsHost(true)
      setStatus('hosting')
      setError(null)

      peer.on('open', (id) => {
        setMyId(id)
        setRoomCode(code)
        const init = createInitialState(id, myNameRef.current)
        stateRef.current = init
        setState(init)
        // l'host si auto-iscrive
        hostApply({ type: 'JOIN', id, name: myNameRef.current })
        setStatus('connected')
      })

      peer.on('connection', (conn) => {
        conn.on('open', () => {
          connsRef.current.set(conn.peer, conn)
          // manda subito lo stato corrente al nuovo arrivato
          conn.send(JSON.stringify({ t: 'SYNC', state: stateRef.current }))
        })
        conn.on('data', (raw) => {
          let msg
          try {
            msg = typeof raw === 'string' ? JSON.parse(raw) : raw
          } catch {
            return
          }
          if (msg.t === 'ACTION') hostApply(msg.action)
        })
        conn.on('close', () => {
          connsRef.current.delete(conn.peer)
          hostApply({ type: 'DISCONNECT', id: conn.peer })
        })
      })

      peer.on('error', (err) => {
        console.error('[Maleficum] errore peer (host)', err?.type, err)
        setError(err?.type === 'unavailable-id' ? 'Codice stanza occupato, riprova.' : err.message)
        setStatus('error')
      })
    },
    [hostApply, teardown]
  )

  // ---- Entra in una stanza (diventa guest) ----
  const joinRoom = useCallback(
    (code, name) => {
      teardown()
      myNameRef.current = name || 'Anima Persa'
      const peer = new Peer(undefined, PEER_OPTS)
      peerRef.current = peer
      isHostRef.current = false
      setIsHost(false)
      setStatus('joining')
      setError(null)

      // Se il data channel non si apre entro il timeout, non lasciamo
      // il giocatore appeso in silenzio: mostriamo un errore utile.
      clearTimeout(joinTimerRef.current)
      joinTimerRef.current = setTimeout(() => {
        if (!hostConnRef.current?.open) {
          console.warn('[Maleficum] timeout: data channel non aperto')
          setStatus('error')
          setError('Connessione non riuscita (rete/NAT). Riprova o usa la stessa rete.')
        }
      }, JOIN_TIMEOUT_MS)

      peer.on('open', (id) => {
        console.debug('[Maleficum] guest peer aperto', id, '→ connetto a', codeToPeerId(code))
        setMyId(id)
        const conn = peer.connect(codeToPeerId(code), { reliable: true })
        hostConnRef.current = conn

        conn.on('open', () => {
          console.debug('[Maleficum] data channel aperto verso host')
          clearTimeout(joinTimerRef.current)
          setRoomCode(code.trim().toUpperCase())
          setStatus('connected')
          conn.send(JSON.stringify({ t: 'ACTION', action: { type: 'JOIN', id, name: myNameRef.current } }))
        })
        conn.on('data', (raw) => {
          let msg
          try {
            msg = typeof raw === 'string' ? JSON.parse(raw) : raw
          } catch {
            return
          }
          if (msg.t === 'SYNC') setBoth(msg.state)
        })
        conn.on('close', () => {
          clearTimeout(joinTimerRef.current)
          setStatus('error')
          setError('Connessione con l’host perduta.')
        })
        conn.on('error', (err) => {
          console.error('[Maleficum] errore connessione', err)
          clearTimeout(joinTimerRef.current)
          setStatus('error')
          setError('Impossibile raggiungere la stanza.')
        })
      })

      peer.on('error', (err) => {
        console.error('[Maleficum] errore peer (guest)', err?.type, err)
        clearTimeout(joinTimerRef.current)
        setError(
          err?.type === 'peer-unavailable'
            ? 'Nessuna stanza con questo codice.'
            : err.message
        )
        setStatus('error')
      })
    },
    [setBoth, teardown]
  )

  const leave = useCallback(() => {
    teardown()
    isHostRef.current = false
    setIsHost(false)
    setState(null)
    stateRef.current = null
    setStatus('idle')
    setRoomCode(null)
    setError(null)
  }, [teardown])

  useEffect(() => () => teardown(), [teardown])

  return {
    status,
    error,
    myId,
    roomCode,
    isHost,
    state,
    hostRoom,
    joinRoom,
    leave,
    dispatch,
  }
}
