// ============================================================
// MALEFICUM — Stato di gioco su un solo dispositivo
// L'Officiante tiene il telefono: crea il cerchio, giudica le
// azioni e le denunce, gestisce turni e punti. Ogni mossa passa
// da questo reducer puro.
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

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 10

const AVATARS = ['🕯️', '💀', '🦇', '🕷️', '🐍', '🐈‍⬛', '🦉', '🕸️', '⚰️', '🔮']

export function createInitialState(lastNames = []) {
  return {
    phase: 'setup', // 'setup' | 'playing' | 'ended'
    players: {},
    // { instanceId, curse, victimId, casterId, turnsSurvived, turnsNeeded }
    activeCurses: [],
    turnOrder: [], // id dei giocatori, ordine deciso a dadi a inizio partita
    turnIndex: 0, // indice in turnOrder di chi gioca ora
    rolls: {}, // { playerId: valore del dado 1-6 }, per l'animazione di rivelazione
    currentAction: null, // { instanceId, action, playerId }
    log: [],
    lastNames,
  }
}

let _seq = 0
const uid = (p) => `${p}-${Date.now().toString(36)}-${(_seq++).toString(36)}`

// I log sono tipizzati (kind) così la UI li colora e li rende leggibili.
function logEntry(text, kind = 'info', extra = {}) {
  return { id: uid('log'), ts: Date.now(), text, kind, ...extra }
}

const activeOn = (state, victimId) =>
  state.activeCurses.filter((c) => c.victimId === victimId)

// Quanti turni del tavolo servono per domare una maledizione.
export function turnsToSurvive(curse) {
  if (curse.kind === 'timer') return curse.turns ?? 3
  return SURVIVE_TURNS[curse.severity] ?? 3
}

const trimLog = (log) => log.slice(0, 80)

function rollTurnOrder(ids, rng) {
  // Si rilancia solo chi pareggia, finché ogni giocatore ha un valore univoco.
  const rolls = {}
  let remaining = ids
  while (remaining.length > 0) {
    const byValue = {}
    for (const id of remaining) (byValue[1 + Math.floor(rng() * 6)] ||= []).push(id)
    remaining = []
    for (const [value, group] of Object.entries(byValue)) {
      if (group.length > 1) remaining.push(...group)
      else rolls[group[0]] = Number(value)
    }
  }
  return { rolls, turnOrder: [...ids].sort((a, b) => rolls[b] - rolls[a]) }
}

const newAction = (playerId, rng) => {
  const action = drawRandomAction(null, rng)
  return action ? { instanceId: uid('action'), action, playerId } : null
}

// Reducer puro. `ctx` inietta { rng } per determinismo/test.
export function gameReducer(state, action, ctx = {}) {
  const rng = ctx.rng ?? Math.random

  switch (action.type) {
    case 'START_GAME': {
      if (state.phase !== 'setup') return state
      const names = action.names.map((name) => name.trim()).filter(Boolean)
      if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) return state

      const players = {}
      names.forEach((name, i) => {
        const id = `p${i + 1}`
        players[id] = { id, name, points: START_POINTS, avatar: AVATARS[i % AVATARS.length] }
      })
      const { rolls, turnOrder } = rollTurnOrder(Object.keys(players), rng)
      const rollsText = turnOrder
        .map((id) => `${players[id].avatar} ${players[id].name} (🎲${rolls[id]})`)
        .join(' → ')

      return {
        ...createInitialState(names),
        phase: 'playing',
        players,
        turnOrder,
        rolls,
        currentAction: newAction(turnOrder[0], rng),
        log: [
          logEntry(`Ordine deciso dai dadi: ${rollsText}`, 'start'),
          logEntry('Il rito ha inizio. Che le maledizioni scendano.', 'start'),
        ],
      }
    }

    case 'CAST': {
      if (state.phase !== 'playing') return state
      const caster = state.players[action.casterId]
      const victim = state.players[action.victimId]
      if (!caster || !victim || caster.id === victim.id) return state
      if (state.turnOrder[state.turnIndex] !== caster.id) return state // si maledice solo nel proprio turno
      if (caster.points < CAST_COST) return state // essenza insufficiente

      const curse =
        (action.curseId && DECK.find((c) => c.id === action.curseId)) ||
        drawRandom(action.category || null, rng)
      if (!curse) return state

      const willBeActive = curse.kind !== 'instant'
      if (willBeActive && activeOn(state, victim.id).length >= MAX_CURSES_PER_VICTIM)
        return state // anima già sovraccarica

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

    case 'DENOUNCE': {
      // L'Officiante ha visto la violazione e decide subito: chi accusa
      // ruba punti pari alla gravità, oppure l'accusa viene respinta.
      if (state.phase !== 'playing') return state
      const inst = state.activeCurses.find((c) => c.instanceId === action.instanceId)
      if (!inst) return state
      const accuser = state.players[action.accuserId]
      const victim = state.players[inst.victimId]
      if (!accuser || !victim || accuser.id === victim.id) return state

      if (!action.approve) {
        return {
          ...state,
          players:
            DENOUNCE_REJECT_PENALTY > 0
              ? {
                  ...state.players,
                  [accuser.id]: { ...accuser, points: accuser.points - DENOUNCE_REJECT_PENALTY },
                }
              : state.players,
          log: trimLog([
            logEntry(
              `L'Officiante respinge l'accusa di ${accuser.avatar} ${accuser.name} su «${inst.curse.title}»`,
              'denounce-reject'
            ),
            ...state.log,
          ]),
        }
      }

      // Accusa confermata: si rubano i punti ma la maledizione RESTA
      // attiva, solo il conto dei turni per domarla riparte da zero.
      const stake = denounceReward(inst.curse.severity)
      return {
        ...state,
        players: {
          ...state.players,
          [victim.id]: { ...victim, points: victim.points - stake },
          [accuser.id]: { ...accuser, points: accuser.points + stake },
        },
        activeCurses: state.activeCurses.map((c) =>
          c.instanceId === inst.instanceId ? { ...c, turnsSurvived: 0 } : c
        ),
        log: trimLog([
          logEntry(
            `${accuser.avatar} ${accuser.name} smaschera ${victim.avatar} ${victim.name}! +${stake} — «${inst.curse.title}» si riavvia`,
            'denounce'
          ),
          ...state.log,
        ]),
      }
    }

    case 'ACTION_RESOLVE': {
      if (state.phase !== 'playing' || !state.currentAction || !state.turnOrder.length) return state
      const player = state.players[state.currentAction.playerId]
      if (!player) return state

      const reward = action.success ? state.currentAction.action.reward : 0
      let players = reward
        ? { ...state.players, [player.id]: { ...player, points: player.points + reward } }
        : state.players

      // Ogni azione risolta è il "tempo" del gioco: le maledizioni
      // avanzano di un turno; chi arriva a `turnsNeeded` è domata e
      // sparisce, premiando la vittima.
      const activeCurses = []
      const survivalLogs = []
      for (const c of state.activeCurses) {
        const turnsSurvived = c.turnsSurvived + 1
        if (turnsSurvived < c.turnsNeeded) {
          activeCurses.push({ ...c, turnsSurvived })
          continue
        }
        const bonus = surviveReward(c.curse.severity)
        const victim = players[c.victimId]
        if (victim) players = { ...players, [victim.id]: { ...victim, points: victim.points + bonus } }
        survivalLogs.push(
          logEntry(`${victim?.avatar ?? '✦'} ${victim?.name ?? '?'} doma «${c.curse.title}» +${bonus}`, 'survive')
        )
      }

      const turnIndex = (state.turnIndex + 1) % state.turnOrder.length

      return {
        ...state,
        players,
        activeCurses,
        turnIndex,
        currentAction: newAction(state.turnOrder[turnIndex], rng),
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

    case 'REDRAW_ACTION': {
      // L'Officiante può cambiare la carta azione se non si adatta al tavolo.
      if (state.phase !== 'playing' || !state.currentAction) return state
      let next = state.currentAction
      for (let i = 0; i < 6 && next.action.id === state.currentAction.action.id; i++)
        next = newAction(state.currentAction.playerId, rng)
      return { ...state, currentAction: next }
    }

    case 'PURIFY': {
      if (state.phase !== 'playing') return state
      const inst = state.activeCurses.find((c) => c.instanceId === action.instanceId)
      if (!inst) return state
      const victim = state.players[inst.victimId]
      const cost = purifyCost(inst.curse.severity)
      if (!victim || victim.points < cost) return state // punti insufficienti

      return {
        ...state,
        players: { ...state.players, [victim.id]: { ...victim, points: victim.points - cost } },
        activeCurses: state.activeCurses.filter((c) => c.instanceId !== action.instanceId),
        log: trimLog([
          logEntry(`${victim.avatar} ${victim.name} si purifica da «${inst.curse.title}» (−${cost})`, 'purify'),
          ...state.log,
        ]),
      }
    }

    case 'REVOKE': {
      if (state.phase !== 'playing') return state
      const inst = state.activeCurses.find((c) => c.instanceId === action.instanceId)
      if (!inst) return state
      const victim = state.players[inst.victimId]
      return {
        ...state,
        activeCurses: state.activeCurses.filter((c) => c.instanceId !== action.instanceId),
        log: trimLog([
          logEntry(`L'Officiante revoca «${inst.curse.title}» su ${victim?.name ?? '?'}`, 'revoke'),
          ...state.log,
        ]),
      }
    }

    case 'ADJUST_POINTS': {
      // Correzione manuale dell'Officiante. Le correzioni consecutive sulla
      // stessa anima si sommano in un'unica riga del grimorio.
      if (state.phase !== 'playing') return state
      const player = state.players[action.playerId]
      if (!player || !action.delta) return state
      const [last, ...rest] = state.log
      const merge = last?.kind === 'adjust' && last.playerId === player.id
      const total = (merge ? last.delta : 0) + action.delta
      const entry = logEntry(
        `L'Officiante corregge i punti di ${player.avatar} ${player.name}: ${total > 0 ? '+' : ''}${total}`,
        'adjust',
        { playerId: player.id, delta: total }
      )
      return {
        ...state,
        players: { ...state.players, [player.id]: { ...player, points: player.points + action.delta } },
        log: trimLog(merge ? (total ? [entry, ...rest] : rest) : [entry, ...state.log]),
      }
    }

    case 'END_GAME':
      if (state.phase !== 'playing') return state
      return {
        ...state,
        phase: 'ended',
        log: trimLog([logEntry('L\'Officiante chiude il rito.', 'start'), ...state.log]),
      }

    case 'RESET':
      return createInitialState(state.lastNames?.length ? state.lastNames : Object.values(state.players).map((p) => p.name))

    default:
      return state
  }
}
