// ============================================================
// MALEFICUM — Stato di gioco (host-autoritativo)
// L'host tiene lo stato ufficiale e lo ribroadcasta ad ogni
// mutazione. I client inviano AZIONI; solo l'host le applica
// tramite questo reducer puro.
// ============================================================

import { DECK, drawRandom } from './deck.js'
import { drawRandomAction } from './actions.js'
import {
  START_POINTS,
  CAST_COST,
  MAX_CURSES_PER_VICTIM,
  SURVIVE_TURNS,
  surviveReward,
  denounceReward,
  DENOUNCE_REJECT_PENALTY,
  purifyCost,
} from './rules.js'

const AVATARS = ['🕯️', '💀', '🦇', '🕷️', '🐍', '🐈‍⬛', '🦉', '🕸️', '⚰️', '🔮']

export function createInitialState(hostId) {
  return {
    phase: 'lobby', // 'lobby' | 'playing'
    hostId,
    players: {},
    // { instanceId, curse, victimId, casterId, turnsSurvived, turnsNeeded, pendingDenounce }
    activeCurses: [],
    turnOrder: [], // id dei giocatori, ordine deciso a dadi a inizio partita
    turnIndex: 0, // indice in turnOrder di chi gioca ora
    rolls: {}, // { playerId: valore del dado 1-6 }, per l'animazione di rivelazione
    hostPlays: true, // se false, l'host fa solo l'Officiante: niente turni/maledizioni su di lui
    currentAction: null, // { instanceId, action, playerId }
    log: [],
  }
}

let _seq = 0
const uid = (p) => `${p}-${Date.now().toString(36)}-${(_seq++).toString(36)}`

// I log sono tipizzati (kind) così la UI li colora e li rende leggibili.
function logEntry(text, kind = 'info') {
  return { id: uid('log'), ts: Date.now(), text, kind }
}

function pickAvatar(players) {
  const used = new Set(Object.values(players).map((p) => p.avatar))
  return AVATARS.find((a) => !used.has(a)) || AVATARS[Object.keys(players).length % AVATARS.length]
}

const activeOn = (state, victimId) =>
  state.activeCurses.filter((c) => c.victimId === victimId)

// Quanti turni del tavolo servono per domare una maledizione.
export function turnsToSurvive(curse) {
  if (curse.kind === 'timer') return curse.turns ?? 3
  return SURVIVE_TURNS[curse.severity] ?? 3
}

const trimLog = (log) => log.slice(0, 80)

// Reducer puro. `ctx` inietta { now, rng } per determinismo/test.
export function gameReducer(state, action, ctx = {}) {
  const now = ctx.now ?? Date.now()
  const rng = ctx.rng ?? Math.random

  switch (action.type) {
    case 'JOIN': {
      const { id, name } = action
      if (state.players[id]) {
        return {
          ...state,
          players: {
            ...state.players,
            [id]: { ...state.players[id], name, connected: true },
          },
        }
      }
      const player = {
        id,
        name: name || 'Anonimo',
        points: START_POINTS,
        avatar: pickAvatar(state.players),
        connected: true,
        isHost: id === state.hostId,
      }
      return {
        ...state,
        players: { ...state.players, [id]: player },
        log: trimLog([
          logEntry(`${player.avatar} ${player.name} entra nel cerchio`, 'join'),
          ...state.log,
        ]),
      }
    }

    case 'DISCONNECT': {
      const p = state.players[action.id]
      if (!p) return state
      return {
        ...state,
        players: { ...state.players, [action.id]: { ...p, connected: false } },
        log: trimLog([
          logEntry(`${p.avatar} ${p.name} svanisce nell'ombra`, 'leave'),
          ...state.log,
        ]),
      }
    }

    case 'START_GAME': {
      if (action.by !== state.hostId) return state
      const hostPlays = action.hostPlays !== false
      const ids = Object.values(state.players)
        .filter((p) => p.connected && (hostPlays || p.id !== state.hostId))
        .map((p) => p.id)
      if (ids.length === 0) return state

      // Tiro dei dadi per decidere l'ordine: si rilancia solo chi pareggia,
      // finché ogni giocatore ha un valore univoco.
      const rolls = {}
      let remaining = ids
      while (remaining.length > 0) {
        const thisRound = {}
        for (const id of remaining) thisRound[id] = 1 + Math.floor(rng() * 6)
        const byValue = {}
        for (const id of remaining) {
          const v = thisRound[id]
          ;(byValue[v] ||= []).push(id)
        }
        remaining = []
        for (const group of Object.values(byValue)) {
          if (group.length > 1) remaining.push(...group) // pareggio: si rilancia
          else rolls[group[0]] = thisRound[group[0]]
        }
      }
      const turnOrder = [...ids].sort((a, b) => rolls[b] - rolls[a])
      const rollsText = turnOrder
        .map((id) => `${state.players[id]?.avatar} ${state.players[id]?.name} (🎲${rolls[id]})`)
        .join(' → ')

      const firstAction = drawRandomAction(null, rng)

      return {
        ...state,
        phase: 'playing',
        hostPlays,
        turnOrder,
        turnIndex: 0,
        rolls,
        currentAction: firstAction
          ? { instanceId: uid('action'), action: firstAction, playerId: turnOrder[0] }
          : null,
        log: trimLog([
          logEntry(`Ordine deciso dai dadi: ${rollsText}`, 'start'),
          logEntry('Il rito ha inizio. Che le maledizioni scendano.', 'start'),
          ...state.log,
        ]),
      }
    }

    case 'CAST': {
      const caster = state.players[action.casterId]
      const victim = state.players[action.victimId]
      if (!caster || !victim || caster.id === victim.id) return state
      if (!state.hostPlays && victim.id === state.hostId) return state // l'Officiante non gioca: non è bersaglio
      if (state.turnOrder[state.turnIndex] !== caster.id) return state // si maledice solo nel proprio turno
      if (caster.points < CAST_COST) return state // essenza insufficiente

      const curse =
        (action.curseId && DECK.find((c) => c.id === action.curseId)) ||
        drawRandom(action.category || null, rng)
      if (!curse) return state

      const willBeActive = curse.kind !== 'instant'
      if (willBeActive && activeOn(state, victim.id).length >= MAX_CURSES_PER_VICTIM)
        return state // anima già sovraccarica

      // Paga il costo del lancio.
      let players = {
        ...state.players,
        [caster.id]: { ...caster, points: caster.points - CAST_COST },
      }

      // Effetto istantaneo del Sacrificio.
      if (curse.id === 'sac-tithe') {
        const c = players[caster.id]
        const v = players[victim.id]
        players = {
          ...players,
          [victim.id]: { ...v, points: v.points - 2 },
          [caster.id]: { ...c, points: c.points + 2 },
        }
      }

      const instance = willBeActive
        ? {
            instanceId: uid('curse'),
            curse,
            victimId: victim.id,
            casterId: caster.id,
            turnsSurvived: 0,
            turnsNeeded: turnsToSurvive(curse),
            pendingDenounce: null,
          }
        : null

      return {
        ...state,
        players,
        activeCurses: willBeActive ? [...state.activeCurses, instance] : state.activeCurses,
        log: trimLog([
          logEntry(
            `${caster.avatar} ${caster.name} maledice ${victim.avatar} ${victim.name}: «${curse.title}»`,
            'cast'
          ),
          ...state.log,
        ]),
      }
    }

    case 'DENOUNCE_REQUEST': {
      // Chiunque può accusare, ma solo la PRIMA accusa su una maledizione
      // conta: resta in sospeso finché l'Officiante non la giudica.
      const inst = state.activeCurses.find((c) => c.instanceId === action.instanceId)
      if (!inst || inst.pendingDenounce) return state
      const accuser = state.players[action.accuserId]
      const victim = state.players[inst.victimId]
      if (!accuser || !victim || accuser.id === victim.id) return state

      return {
        ...state,
        activeCurses: state.activeCurses.map((c) =>
          c.instanceId === inst.instanceId
            ? { ...c, pendingDenounce: { accuserId: accuser.id, at: now } }
            : c
        ),
        log: trimLog([
          logEntry(
            `${accuser.avatar} ${accuser.name} accusa ${victim.avatar} ${victim.name} di aver violato «${inst.curse.title}» — attende il giudizio dell'Officiante`,
            'denounce-pending'
          ),
          ...state.log,
        ]),
      }
    }

    case 'DENOUNCE_RESOLVE': {
      // Solo l'Officiante (host) giudica l'accusa: approva o respinge.
      if (action.by !== state.hostId) return state
      const inst = state.activeCurses.find((c) => c.instanceId === action.instanceId)
      if (!inst || !inst.pendingDenounce) return state
      const accuser = state.players[inst.pendingDenounce.accuserId]
      const victim = state.players[inst.victimId]

      if (!action.approve) {
        const players =
          accuser && DENOUNCE_REJECT_PENALTY > 0
            ? {
                ...state.players,
                [accuser.id]: { ...accuser, points: accuser.points - DENOUNCE_REJECT_PENALTY },
              }
            : state.players
        return {
          ...state,
          players,
          activeCurses: state.activeCurses.map((c) =>
            c.instanceId === inst.instanceId ? { ...c, pendingDenounce: null } : c
          ),
          log: trimLog([
            logEntry(`L'Officiante respinge l'accusa su «${inst.curse.title}»`, 'denounce-reject'),
            ...state.log,
          ]),
        }
      }

      // Accusa confermata: si rubano i punti ma la maledizione RESTA
      // attiva, solo il conto dei turni per domarla riparte da zero.
      const stake = denounceReward(inst.curse.severity)
      const players = {
        ...state.players,
        ...(victim ? { [victim.id]: { ...victim, points: victim.points - stake } } : {}),
        ...(accuser ? { [accuser.id]: { ...accuser, points: accuser.points + stake } } : {}),
      }

      return {
        ...state,
        players,
        activeCurses: state.activeCurses.map((c) =>
          c.instanceId === inst.instanceId
            ? { ...c, pendingDenounce: null, turnsSurvived: 0 }
            : c
        ),
        log: trimLog([
          logEntry(
            `L'Officiante conferma: ${accuser?.avatar ?? ''} ${accuser?.name ?? '?'} smaschera ${victim?.avatar ?? ''} ${victim?.name ?? '?'}! +${stake} — «${inst.curse.title}» si riavvia`,
            'denounce'
          ),
          ...state.log,
        ]),
      }
    }

    case 'ACTION_RESOLVE': {
      // Solo l'Officiante (host) giudica l'esito: ha visto la performance
      // dal vivo ed è l'unico arbitro, così il resto del tavolo (incluso
      // chi ha appena giocato) non deve validare nulla dal telefono.
      if (action.by !== state.hostId) return state
      if (!state.currentAction || !state.turnOrder.length) return state
      const player = state.players[state.currentAction.playerId]
      if (!player) return state

      const reward = action.success ? state.currentAction.action.reward : 0
      let players = reward
        ? { ...state.players, [player.id]: { ...player, points: player.points + reward } }
        : state.players

      // Ogni azione risolta è il "tempo" del gioco: le maledizioni non
      // sotto giudizio avanzano di un turno; chi arriva a `turnsNeeded`
      // è domata e sparisce, premiando la vittima.
      const activeCurses = []
      const survivalLogs = []
      for (const c of state.activeCurses) {
        if (c.pendingDenounce) {
          activeCurses.push(c)
          continue
        }
        const turnsSurvived = c.turnsSurvived + 1
        if (turnsSurvived < c.turnsNeeded) {
          activeCurses.push({ ...c, turnsSurvived })
          continue
        }
        const bonus = surviveReward(c.curse.severity)
        const victim = players[c.victimId]
        if (victim) players = { ...players, [victim.id]: { ...victim, points: victim.points + bonus } }
        survivalLogs.push(
          logEntry(
            `${victim?.avatar ?? '✦'} ${victim?.name ?? '?'} doma «${c.curse.title}» +${bonus}`,
            'survive'
          )
        )
      }

      const turnIndex = (state.turnIndex + 1) % state.turnOrder.length
      const nextPlayerId = state.turnOrder[turnIndex]
      const nextAction = drawRandomAction(null, rng)

      return {
        ...state,
        players,
        activeCurses,
        turnIndex,
        currentAction: nextAction
          ? { instanceId: uid('action'), action: nextAction, playerId: nextPlayerId }
          : null,
        log: trimLog([
          ...survivalLogs,
          logEntry(
            action.success
              ? `${player.avatar} ${player.name} compie «${state.currentAction.action.title}» +${reward}`
              : `${player.avatar} ${player.name} fallisce «${state.currentAction.action.title}»`,
            action.success ? 'action-success' : 'action-fail'
          ),
          ...state.log,
        ]),
      }
    }

    case 'PURIFY': {
      const inst = state.activeCurses.find((c) => c.instanceId === action.instanceId)
      if (!inst) return state
      const victim = state.players[inst.victimId]
      // Solo la vittima può purificarsi.
      if (!victim || action.by !== victim.id) return state
      const cost = purifyCost(inst.curse.severity)
      if (victim.points < cost) return state // punti insufficienti

      return {
        ...state,
        players: {
          ...state.players,
          [victim.id]: { ...victim, points: victim.points - cost },
        },
        activeCurses: state.activeCurses.filter((c) => c.instanceId !== action.instanceId),
        log: trimLog([
          logEntry(
            `${victim.avatar} ${victim.name} si purifica da «${inst.curse.title}» (−${cost})`,
            'purify'
          ),
          ...state.log,
        ]),
      }
    }

    case 'REVOKE': {
      // Solo l'Officiante può revocare (arbitro).
      if (action.by !== state.hostId) return state
      const inst = state.activeCurses.find((c) => c.instanceId === action.instanceId)
      if (!inst) return state
      const victim = state.players[inst.victimId]
      return {
        ...state,
        activeCurses: state.activeCurses.filter((c) => c.instanceId !== action.instanceId),
        log: trimLog([
          logEntry(
            `L'Officiante revoca «${inst.curse.title}» su ${victim?.name ?? '?'}`,
            'revoke'
          ),
          ...state.log,
        ]),
      }
    }

    case 'RESET_ROUND': {
      if (action.by !== state.hostId) return state
      return { ...state, activeCurses: [] }
    }

    // Applica uno stato completo ricevuto dall'host (lato client).
    case 'SYNC':
      return action.state

    default:
      return state
  }
}
