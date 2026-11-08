import test from 'node:test'
import assert from 'node:assert/strict'
import { createInitialState, gameReducer, turnsToSurvive } from '../src/game/state.js'
import { ACTIONS } from '../src/game/actions.js'
import { DECK } from '../src/game/deck.js'
import { CAST_COST, START_POINTS, TRUE_NAME_PENALTY } from '../src/game/rules.js'

function seeded(seed = 7) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function start(names = ['Ada', 'Bea', 'Cleo', 'Dario'], goal) {
  const rng = seeded()
  const run = (state, action) => gameReducer(state, action, { rng })
  return { run, state: run(createInitialState(), { type: 'START_GAME', names, goal }) }
}

const turnId = (s) => s.turnOrder[s.turnIndex]
const other = (s, ...not) => s.turnOrder.find((id) => !not.includes(id))
const curse = (id) => DECK.find((c) => c.id === id)

test('il rito parte con i nomi scelti, punti iniziali e ordine dei dadi', () => {
  const { state } = start()
  assert.equal(state.phase, 'playing')
  assert.deepEqual(Object.values(state.players).map((p) => p.name).sort(), ['Ada', 'Bea', 'Cleo', 'Dario'])
  assert.ok(Object.values(state.players).every((p) => p.points === START_POINTS))
  assert.equal(new Set(Object.values(state.rolls)).size, 4)
  assert.deepEqual(state.goal, { type: 'rounds', value: 3 })
  assert.ok(state.currentAction.action)
})

test('il mazzo delle azioni non ripete carte finché non è finito', () => {
  let { run, state } = start()
  const seen = [state.currentAction.action.id]
  for (let i = 1; i < ACTIONS.length; i++) {
    state = run(state, { type: 'REDRAW_ACTION' })
    seen.push(state.currentAction.action.id)
  }
  assert.equal(new Set(seen).size, ACTIONS.length)
})

test('scagliare costa punti, rivela la carta e la durata scala con le anime', () => {
  let { run, state } = start(['A', 'B', 'C', 'D', 'E', 'F'])
  const caster = turnId(state)
  const victim = other(state, caster)
  state = run(state, { type: 'CAST', casterId: caster, victimId: victim, curseId: 'fav-no-si-no' })
  assert.equal(state.players[caster].points, START_POINTS - CAST_COST)
  assert.equal(state.reveal.curse.id, 'fav-no-si-no')
  assert.equal(state.activeCurses[0].turnsNeeded, 9)
  assert.equal(turnsToSurvive(curse('fav-whisper'), 6), 3)
})

test('la denuncia confermata premia chi smaschera e chi aveva maledetto', () => {
  let { run, state } = start()
  const caster = turnId(state)
  const victim = other(state, caster)
  const accuser = other(state, caster, victim)
  state = run(state, { type: 'CAST', casterId: caster, victimId: victim, curseId: 'fav-rhyme' })
  state = run(state, { type: 'ACTION_RESOLVE', score: 0 })
  const inst = state.activeCurses[0]
  assert.equal(inst.turnsSurvived, 1)
  state = run(state, { type: 'DENOUNCE', instanceId: inst.instanceId, accuserId: accuser, approve: true })
  assert.equal(state.players[victim].points, START_POINTS - 3)
  assert.equal(state.players[accuser].points, START_POINTS + 3)
  assert.equal(state.players[caster].points, START_POINTS - CAST_COST + 3)
  assert.equal(state.activeCurses[0].turnsSurvived, 0)
})

test('chi ha maledetto e smaschera da solo incassa entrambe le ricompense', () => {
  let { run, state } = start()
  const caster = turnId(state)
  const victim = other(state, caster)
  state = run(state, { type: 'CAST', casterId: caster, victimId: victim, curseId: 'fav-third' })
  const inst = state.activeCurses[0]
  state = run(state, { type: 'DENOUNCE', instanceId: inst.instanceId, accuserId: caster, approve: true })
  assert.equal(state.players[caster].points, START_POINTS - CAST_COST + 2)
})

test('Decima di Sangue sposta subito i punti', () => {
  let { run, state } = start()
  const caster = turnId(state)
  const victim = other(state, caster)
  state = run(state, { type: 'CAST', casterId: caster, victimId: victim, curseId: 'sac-tithe' })
  assert.equal(state.players[victim].points, START_POINTS - 2)
  assert.equal(state.players[caster].points, START_POINTS - CAST_COST + 2)
  assert.equal(state.reveal.resolved, true)
  assert.equal(state.activeCurses.length, 0)
})

test('Il Vero Nome blocca il turno finché la vittima non sceglie', () => {
  let { run, state } = start()
  const caster = turnId(state)
  const victim = other(state, caster)
  state = run(state, { type: 'CAST', casterId: caster, victimId: victim, curseId: 'sac-name' })
  assert.equal(state.reveal.resolved, false)
  assert.equal(run(state, { type: 'ACTION_RESOLVE', score: 2 }), state)
  const paid = run(state, { type: 'RESOLVE_INSTANT', choice: 'pay' })
  assert.equal(paid.players[victim].points, START_POINTS - TRUE_NAME_PENALTY)
  const told = run(state, { type: 'RESOLVE_INSTANT', choice: 'secret' })
  assert.equal(told.players[victim].points, START_POINTS)
  assert.equal(told.reveal.resolved, true)
})

test('Contro-Maleficio fa scagliare alla vittima una maledizione gratis', () => {
  let { run, state } = start()
  const caster = turnId(state)
  const victim = other(state, caster)
  state = run(state, { type: 'CAST', casterId: caster, victimId: victim, curseId: 'sac-curse-back' })
  assert.equal(run(state, { type: 'RESOLVE_INSTANT', targetId: victim }), state)
  state = run(state, { type: 'RESOLVE_INSTANT', targetId: caster })
  const inst = state.activeCurses[0]
  assert.equal(inst.victimId, caster)
  assert.equal(inst.casterId, victim)
  assert.notEqual(inst.curse.kind, 'instant')
  assert.equal(state.players[victim].points, START_POINTS)
  assert.equal(state.reveal.counter, true)
})

test('il voto della prova va da 0 a 3', () => {
  let { run, state } = start()
  const first = turnId(state)
  state = run(state, { type: 'ACTION_RESOLVE', score: 7 })
  assert.equal(state.players[first].points, START_POINTS + 3)
  const second = turnId(state)
  state = run(state, { type: 'ACTION_RESOLVE', score: 0 })
  assert.equal(state.players[second].points, START_POINTS)
})

test('chi resiste fino in fondo doma la maledizione e guadagna la gravità', () => {
  let { run, state } = start(['A', 'B'])
  const caster = turnId(state)
  const victim = other(state, caster)
  state = run(state, { type: 'CAST', casterId: caster, victimId: victim, curseId: 'fav-third' })
  assert.equal(state.activeCurses[0].turnsNeeded, 2)
  state = run(state, { type: 'ACTION_RESOLVE', score: 0 })
  state = run(state, { type: 'ACTION_RESOLVE', score: 0 })
  assert.equal(state.activeCurses.length, 0)
  assert.equal(state.players[victim].points, START_POINTS + 1)
})

test('il rito finisce dopo i giri scelti', () => {
  let { run, state } = start(['A', 'B', 'C'], { type: 'rounds', value: 2 })
  for (let i = 0; i < 5; i++) state = run(state, { type: 'ACTION_RESOLVE', score: 1 })
  assert.equal(state.phase, 'playing')
  assert.equal(state.round, 2)
  state = run(state, { type: 'ACTION_RESOLVE', score: 1 })
  assert.equal(state.phase, 'ended')
})

test('il rito finisce quando qualcuno raggiunge il traguardo di punti', () => {
  let { run, state } = start(['A', 'B', 'C'], { type: 'points', value: 25 })
  let turns = 0
  while (state.phase === 'playing' && turns < 50) {
    state = run(state, { type: 'ACTION_RESOLVE', score: 3 })
    turns++
  }
  assert.equal(state.phase, 'ended')
  assert.ok(Object.values(state.players).some((p) => p.points >= 25))
  assert.equal(turns, 10)
})
