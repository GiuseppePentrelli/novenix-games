// ============================================================
// MALEFICUM — Modalità Anteprima (demo locale, niente P2P)
// Stessa interfaccia di usePeerRoom, ma lo stato vive in locale
// e il reducer gira in-process. Serve per vedere/iterare la UI
// senza aprire due tab né avviare una stanza.
// ============================================================

import { useCallback, useMemo, useRef, useState } from 'react'
import { gameReducer, createInitialState } from '../game/state.js'
import { drawRandomAction } from '../game/actions.js'

const BOTS = [
  ['you', 'Tu'],
  ['bot1', 'Morgana'],
  ['bot2', 'Baphomet'],
  ['bot3', 'Lilith'],
]

// Ordine e tiri di turno fissi per la demo (in partita reale li decide
// il dado vero). Due varianti: l'host ("you") gioca oppure no — esattamente
// come sceglie l'host nella sala d'attesa di una partita vera.
const DEMO_ORDER_PLAYING = ['bot1', 'bot2', 'you', 'bot3']
const DEMO_ROLLS_PLAYING = { bot1: 6, bot2: 5, you: 3, bot3: 1 }
const DEMO_ORDER_HOST_ONLY = ['bot1', 'bot2', 'bot3']
const DEMO_ROLLS_HOST_ONLY = { bot1: 6, bot2: 4, bot3: 2 }

function seed(hostPlays = true) {
  let s = createInitialState('you')
  for (const [id, name] of BOTS) s = gameReducer(s, { type: 'JOIN', id, name })
  s = gameReducer(s, { type: 'START_GAME', by: 'you', hostPlays })

  const order = hostPlays ? DEMO_ORDER_PLAYING : DEMO_ORDER_HOST_ONLY
  const rolls = hostPlays ? DEMO_ROLLS_PLAYING : DEMO_ROLLS_HOST_ONLY

  // Qualche maledizione già in scena. Il CAST è vincolato al proprio
  // turno: per popolare la scena "prestiamo" temporaneamente il turno
  // a ciascun caster, poi lo rimettiamo al primo dell'ordine.
  const seedCasts = hostPlays
    ? [
        ['bot1', 'you'],
        ['bot2', 'you'],
        ['you', 'bot3'],
        ['bot1', 'bot2'],
      ]
    : [
        ['bot1', 'bot2'],
        ['bot2', 'bot3'],
        ['bot3', 'bot1'],
      ]
  for (const [casterId, victimId] of seedCasts) {
    s = { ...s, turnOrder: order, turnIndex: order.indexOf(casterId) }
    s = gameReducer(s, { type: 'CAST', casterId, victimId })
  }

  return {
    ...s,
    turnOrder: order,
    turnIndex: 0,
    rolls,
    currentAction: { instanceId: 'demo-action', action: drawRandomAction(), playerId: order[0] },
  }
}

export function useLocalGame() {
  const [state, setState] = useState(() => seed(true))
  const [myId, setMyId] = useState('you')
  const stateRef = useRef(state)
  stateRef.current = state

  const dispatch = useCallback((action) => {
    setState((s) => gameReducer(s, action))
  }, [])

  // Ricomincia la demo scegliendo se l'host ("you") gioca oppure fa solo
  // l'Officiante — stessa scelta della sala d'attesa in una partita vera.
  const restart = useCallback((hostPlays) => {
    setState(seed(hostPlays))
  }, [])

  // Simula il turno del giocatore designato: a volte lancia una
  // maledizione (mai verso l'host se non gioca), poi l'host giudica
  // l'azione (esito a caso) e il turno passa.
  const randomEvent = useCallback(() => {
    const s = stateRef.current
    const turnId = s.turnOrder[s.turnIndex]
    if (!turnId) return

    if (s.players[turnId]?.points >= 3 && Math.random() < 0.6) {
      const victims = Object.keys(s.players).filter(
        (id) => id !== turnId && (s.hostPlays || id !== s.hostId)
      )
      const victimId = victims[Math.floor(Math.random() * victims.length)]
      dispatch({ type: 'CAST', casterId: turnId, victimId })
    }
    dispatch({ type: 'ACTION_RESOLVE', by: s.hostId, success: Math.random() < 0.7 })
  }, [dispatch])

  const players = useMemo(() => Object.values(state.players), [state.players])

  return {
    state,
    myId,
    roomCode: 'DEMO',
    isHost: myId === state.hostId,
    dispatch,
    players,
    setMyId,
    randomEvent,
    restart,
  }
}
