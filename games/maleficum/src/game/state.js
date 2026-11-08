// ============================================================
// MALEFICUM — Stato di gioco su un solo dispositivo
// L'Officiante tiene il telefono: crea il cerchio, giudica le
// prove e le denunce, gestisce turni e punti. Ogni mossa passa
// da questo reducer puro.
// ============================================================

import { CATEGORIES, DECK } from './deck.js'
import { ACTIONS } from './actions.js'
import {
  START_POINTS,
  CAST_COST,
  MAX_CURSES_PER_VICTIM,
  SURVIVE_ROUNDS,
  surviveReward,
  denounceReward,
  casterReward,
  DENOUNCE_REJECT_PENALTY,
  purifyCost,
  VOTE_MAX,
  TRUE_NAME_PENALTY,
  TITHE_POINTS,
  GOALS,
  DEFAULT_GOAL,
} from './rules.js'

export const STATE_VERSION = 2
export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 10

const AVATARS = ['🕯️', '💀', '🦇', '🕷️', '🐍', '🐈‍⬛', '🦉', '🕸️', '⚰️', '🔮']

export function validGoal(goal) {
  if (goal?.type === 'free') return true
  return Boolean(GOALS[goal?.type]?.includes(goal?.value))
}

export function createInitialState(lastNames = [], goal = DEFAULT_GOAL) {
  return {
    version: STATE_VERSION,
    phase: 'setup', // 'setup' | 'playing' | 'ended'
    players: {},
    // { instanceId, curse, victimId, casterId, turnsSurvived, turnsNeeded }
    activeCurses: [],
    turnOrder: [], // id dei giocatori, ordine deciso a dadi a inizio partita
    turnIndex: 0, // indice in turnOrder di chi gioca ora
    round: 1, // giro del tavolo in corso
    goal: validGoal(goal) ? goal : DEFAULT_GOAL,
    rolls: {}, // { playerId: valore del dado 1-6 }, per l'animazione di rivelazione
    currentAction: null, // { instanceId, action, playerId }
    bags: {}, // mazzi mescolati: si pesca senza ripetizioni finché non finiscono
    reveal: null, // ultima maledizione pescata, da mostrare al cerchio
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

const trimLog = (log) => log.slice(0, 80)

const activeOn = (state, victimId) => state.activeCurses.filter((c) => c.victimId === victimId)
const canReceive = (state, playerId) => activeOn(state, playerId).length < MAX_CURSES_PER_VICTIM

// Turni del tavolo necessari per domare una maledizione: i vincoli durano
// giri interi (scalati sul numero di anime), quelle a tempo i turni scritti.
export function turnsToSurvive(curse, playerCount) {
  if (curse.kind === 'timer') return curse.turns ?? 3
  return Math.max(2, Math.round((SURVIVE_ROUNDS[curse.severity] ?? 1) * playerCount))
}

function shuffle(ids, rng) {
  const out = [...ids]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function drawFrom(bags, key, ids, rng) {
  const bag = bags[key]?.length ? bags[key] : shuffle(ids, rng)
  return { id: bag[0], bags: { ...bags, [key]: bag.slice(1) } }
}

const ACTION_IDS = ACTIONS.map((a) => a.id)
const CURSE_IDS = Object.fromEntries(
  Object.keys(CATEGORIES).map((cat) => [cat, DECK.filter((c) => c.category === cat).map((c) => c.id)])
)

function drawAction(bags, rng) {
  const { id, bags: next } = drawFrom(bags, 'actions', ACTION_IDS, rng)
  return { action: ACTIONS.find((a) => a.id === id), bags: next }
}

// "A sorte" sceglie il capitolo in proporzione alle sue carte, poi pesca
// dal mazzo di quel capitolo: stessa probabilità di pescare dal grimorio intero.
function drawCurse(bags, category, rng, { allowInstant = true } = {}) {
  let cat = category
  if (!cat) {
    const pool = Object.keys(CURSE_IDS).filter(
      (c) => allowInstant || DECK.some((d) => d.category === c && d.kind !== 'instant')
    )
    const total = pool.reduce((n, c) => n + CURSE_IDS[c].length, 0)
    let r = rng() * total
    cat = pool.find((c) => (r -= CURSE_IDS[c].length) < 0) ?? pool[pool.length - 1]
  }
  const { id, bags: next } = drawFrom(bags, `curse:${cat}`, CURSE_IDS[cat], rng)
  return { curse: DECK.find((c) => c.id === id), bags: next }
}

const withAction = (state, playerId, rng) => {
  const { action, bags } = drawAction(state.bags, rng)
  return { bags, currentAction: { instanceId: uid('action'), action, playerId } }
}

const addPoints = (players, id, delta) =>
  players[id] ? { ...players, [id]: { ...players[id], points: players[id].points + delta } } : players

const curseInstance = (state, curse, casterId, victimId) => ({
  instanceId: uid('curse'),
  curse,
  victimId,
  casterId,
  turnsSurvived: 0,
  turnsNeeded: turnsToSurvive(curse, state.turnOrder.length),
})

const pendingInstant = (state) => state.reveal && !state.reveal.resolved

// Reducer puro. `ctx` inietta { rng } per determinismo/test.
export function gameReducer(state, action, ctx = {}) {
  const rng = ctx.rng ?? Math.random

  switch (action.type) {
    case 'START_GAME': {
      if (state.phase !== 'setup') return state
      const names = action.names.map((name) => name.trim()).filter(Boolean)
      if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) return state
      const goal = validGoal(action.goal) ? action.goal : DEFAULT_GOAL

      const players = {}
      names.forEach((name, i) => {
        const id = `p${i + 1}`
        players[id] = { id, name, points: START_POINTS, avatar: AVATARS[i % AVATARS.length] }
      })

      // Tiro dei dadi: si rilancia solo chi pareggia, finché ogni valore è unico.
      const rolls = {}
      let remaining = Object.keys(players)
      while (remaining.length > 0) {
        const byValue = {}
        for (const id of remaining) (byValue[1 + Math.floor(rng() * 6)] ||= []).push(id)
        remaining = []
        for (const [value, group] of Object.entries(byValue)) {
          if (group.length > 1) remaining.push(...group)
          else rolls[group[0]] = Number(value)
        }
      }
      const turnOrder = Object.keys(players).sort((a, b) => rolls[b] - rolls[a])
      const rollsText = turnOrder
        .map((id) => `${players[id].avatar} ${players[id].name} (🎲${rolls[id]})`)
        .join(' → ')

      const base = { ...createInitialState(names, goal), phase: 'playing', players, turnOrder, rolls }
      return {
        ...base,
        ...withAction(base, turnOrder[0], rng),
        log: [
          logEntry(`Ordine deciso dai dadi: ${rollsText}`, 'start'),
          logEntry('Il rito ha inizio. Che le maledizioni scendano.', 'start'),
        ],
      }
    }

    case 'CAST': {
      if (state.phase !== 'playing' || pendingInstant(state)) return state
      const caster = state.players[action.casterId]
      const victim = state.players[action.victimId]
      if (!caster || !victim || caster.id === victim.id) return state
      if (state.turnOrder[state.turnIndex] !== caster.id) return state // si maledice solo nel proprio turno
      if (caster.points < CAST_COST) return state // essenza insufficiente

      let bags = state.bags
      let curse = action.curseId && DECK.find((c) => c.id === action.curseId)
      if (!curse) ({ curse, bags } = drawCurse(bags, action.category || null, rng))
      if (!curse) return state

      const instant = curse.kind === 'instant'
      if (!instant && !canReceive(state, victim.id)) return state // anima già sovraccarica

      let players = addPoints(state.players, caster.id, -CAST_COST)
      let activeCurses = state.activeCurses
      let instanceId = null
      const logs = [
        logEntry(`${caster.avatar} ${caster.name} maledice ${victim.avatar} ${victim.name}: «${curse.title}»`, 'cast'),
      ]

      if (curse.id === 'sac-tithe') {
        players = addPoints(addPoints(players, victim.id, -TITHE_POINTS), caster.id, TITHE_POINTS)
        logs.unshift(logEntry(`${victim.name} cede ${TITHE_POINTS} punti a ${caster.name}`, 'cast'))
      } else if (!instant) {
        const inst = curseInstance(state, curse, caster.id, victim.id)
        instanceId = inst.instanceId
        activeCurses = [...activeCurses, inst]
      }

      return {
        ...state,
        players,
        activeCurses,
        bags,
        reveal: {
          id: uid('reveal'),
          curse,
          casterId: caster.id,
          victimId: victim.id,
          instanceId,
          resolved: !instant || curse.id === 'sac-tithe',
        },
        log: trimLog([...logs, ...state.log]),
      }
    }

    case 'RESOLVE_INSTANT': {
      // Le carte Sacrificio che chiedono una scelta restano in sospeso
      // finché l'Officiante non registra cosa è successo.
      if (!pendingInstant(state)) return state
      const { curse, victimId } = state.reveal
      const victim = state.players[victimId]

      if (curse.id === 'sac-name') {
        const paid = action.choice === 'pay'
        return {
          ...state,
          players: paid ? addPoints(state.players, victimId, -TRUE_NAME_PENALTY) : state.players,
          reveal: { ...state.reveal, resolved: true, outcome: paid ? 'pay' : 'secret' },
          log: trimLog([
            logEntry(
              paid
                ? `${victim.avatar} ${victim.name} tace il suo segreto e perde ${TRUE_NAME_PENALTY} punti`
                : `${victim.avatar} ${victim.name} rivela un segreto imbarazzante`,
              paid ? 'cast' : 'info'
            ),
            ...state.log,
          ]),
        }
      }

      if (curse.id === 'sac-curse-back') {
        // Il maleficio si rovescia: la vittima pesca una maledizione e la
        // scaglia gratis su un'altra anima a sua scelta.
        const target = state.players[action.targetId]
        if (!target) {
          if (state.turnOrder.some((id) => id !== victimId && canReceive(state, id))) return state
          return {
            ...state,
            reveal: { ...state.reveal, resolved: true },
            log: trimLog([logEntry(`Il contro-maleficio di ${victim.name} si dissolve: nessuna anima può riceverlo`, 'info'), ...state.log]),
          }
        }
        if (target.id === victimId || !canReceive(state, target.id)) return state
        const { curse: drawn, bags } = drawCurse(state.bags, null, rng, { allowInstant: false })
        const inst = curseInstance(state, drawn, victimId, target.id)
        return {
          ...state,
          bags,
          activeCurses: [...state.activeCurses, inst],
          reveal: {
            id: uid('reveal'),
            curse: drawn,
            casterId: victimId,
            victimId: target.id,
            instanceId: inst.instanceId,
            resolved: true,
            counter: true,
          },
          log: trimLog([
            logEntry(`${victim.avatar} ${victim.name} rovescia il maleficio su ${target.avatar} ${target.name}: «${drawn.title}»`, 'cast'),
            ...state.log,
          ]),
        }
      }

      return { ...state, reveal: { ...state.reveal, resolved: true } }
    }

    case 'DISMISS_REVEAL':
      if (!state.reveal || pendingInstant(state)) return state
      return { ...state, reveal: null }

    case 'DENOUNCE': {
      // L'Officiante ha visto la violazione e decide subito.
      if (state.phase !== 'playing') return state
      const inst = state.activeCurses.find((c) => c.instanceId === action.instanceId)
      if (!inst) return state
      const accuser = state.players[action.accuserId]
      const victim = state.players[inst.victimId]
      if (!accuser || !victim || accuser.id === victim.id) return state

      if (!action.approve) {
        return {
          ...state,
          players: DENOUNCE_REJECT_PENALTY > 0 ? addPoints(state.players, accuser.id, -DENOUNCE_REJECT_PENALTY) : state.players,
          log: trimLog([
            logEntry(`L'Officiante respinge l'accusa di ${accuser.avatar} ${accuser.name} su «${inst.curse.title}»`, 'denounce-reject'),
            ...state.log,
          ]),
        }
      }

      // Accusa confermata: chi smaschera ruba la gravità, chi aveva scagliato
      // guadagna altrettanto. La maledizione RESTA e il conto riparte da zero.
      const stake = denounceReward(inst.curse.severity)
      const bonus = casterReward(inst.curse.severity)
      const caster = state.players[inst.casterId]
      let players = addPoints(addPoints(state.players, victim.id, -stake), accuser.id, stake)
      if (caster) players = addPoints(players, caster.id, bonus)
      return {
        ...state,
        players,
        activeCurses: state.activeCurses.map((c) => (c.instanceId === inst.instanceId ? { ...c, turnsSurvived: 0 } : c)),
        log: trimLog([
          logEntry(
            `${accuser.avatar} ${accuser.name} smaschera ${victim.avatar} ${victim.name}! +${stake}` +
              (caster ? ` · ${caster.name} +${bonus} per il maleficio` : '') +
              ` — «${inst.curse.title}» si riavvia`,
            'denounce'
          ),
          ...state.log,
        ]),
      }
    }

    case 'ACTION_RESOLVE': {
      if (state.phase !== 'playing' || pendingInstant(state) || !state.currentAction) return state
      const player = state.players[state.currentAction.playerId]
      if (!player) return state

      const score = Math.max(0, Math.min(VOTE_MAX, Math.round(Number(action.score) || 0)))
      let players = addPoints(state.players, player.id, score)

      // Ogni prova giudicata è il "tempo" del gioco: le maledizioni
      // avanzano di un turno; chi arriva a `turnsNeeded` è domata.
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
        players = addPoints(players, c.victimId, bonus)
        survivalLogs.push(logEntry(`${victim?.avatar ?? '✦'} ${victim?.name ?? '?'} doma «${c.curse.title}» +${bonus}`, 'survive'))
      }

      const turnIndex = (state.turnIndex + 1) % state.turnOrder.length
      const roundDone = turnIndex === 0
      const round = roundDone ? state.round + 1 : state.round
      const title = state.currentAction.action.title
      const logs = [
        ...survivalLogs,
        logEntry(
          score > 0
            ? `${player.avatar} ${player.name} compie «${title}» — voto ${score}/${VOTE_MAX}, +${score}`
            : `${player.avatar} ${player.name} fallisce «${title}»`,
          score > 0 ? 'action-success' : 'action-fail'
        ),
      ]

      const { goal } = state
      const ended =
        (goal.type === 'rounds' && roundDone && state.round >= goal.value) ||
        (goal.type === 'points' && Object.values(players).some((p) => p.points >= goal.value))

      const next = { ...state, players, activeCurses, turnIndex, round, reveal: null }
      if (ended) {
        return {
          ...next,
          phase: 'ended',
          currentAction: null,
          log: trimLog([
            logEntry(goal.type === 'rounds' ? `Ultimo giro compiuto: il rito si chiude.` : `Traguardo di ${goal.value} punti raggiunto: il rito si chiude.`, 'start'),
            ...logs,
            ...state.log,
          ]),
        }
      }
      return {
        ...next,
        ...withAction(next, state.turnOrder[turnIndex], rng),
        log: trimLog([
          ...(roundDone ? [logEntry(`Inizia il giro ${round}`, 'start')] : []),
          ...logs,
          ...state.log,
        ]),
      }
    }

    case 'REDRAW_ACTION':
      // L'Officiante può cambiare la carta azione se non si adatta al tavolo.
      if (state.phase !== 'playing' || !state.currentAction || pendingInstant(state)) return state
      return { ...state, ...withAction(state, state.currentAction.playerId, rng) }

    case 'PURIFY': {
      if (state.phase !== 'playing') return state
      const inst = state.activeCurses.find((c) => c.instanceId === action.instanceId)
      if (!inst) return state
      const victim = state.players[inst.victimId]
      const cost = purifyCost(inst.curse.severity)
      if (!victim || victim.points < cost) return state // punti insufficienti

      return {
        ...state,
        players: addPoints(state.players, victim.id, -cost),
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
        log: trimLog([logEntry(`L'Officiante revoca «${inst.curse.title}» su ${victim?.name ?? '?'}`, 'revoke'), ...state.log]),
      }
    }

    case 'ADJUST_POINTS': {
      // Correzione manuale: le correzioni consecutive sulla stessa anima
      // si sommano in un'unica riga del grimorio.
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
        players: addPoints(state.players, player.id, action.delta),
        log: trimLog(merge ? (total ? [entry, ...rest] : rest) : [entry, ...state.log]),
      }
    }

    case 'END_GAME':
      if (state.phase !== 'playing') return state
      return {
        ...state,
        phase: 'ended',
        reveal: null,
        log: trimLog([logEntry("L'Officiante chiude il rito.", 'start'), ...state.log]),
      }

    case 'RESET':
      return createInitialState(
        state.lastNames?.length ? state.lastNames : Object.values(state.players).map((p) => p.name),
        state.goal
      )

    default:
      return state
  }
}
