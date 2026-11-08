import { pickLocation, pickRoles } from '../data/locations'

export const PHASE = {
  LOBBY: 'LOBBY',
  PLAYING: 'PLAYING',
  ACCUSATION: 'ACCUSATION',
  SPY_GUESS: 'SPY_GUESS',
  RESULTS: 'RESULTS',
}

export const initialState = {
  phase: PHASE.LOBBY,
  players: [], // { id, name, isHost }
  settings: { timerMinutes: 8 },
  round: null, // { locationId, locationName, spyId, assignments, turnOrder, currentTurnIndex, clues, startedAt, endsAt }
  accusation: null, // { accuserId, accusedId, votes: { [playerId]: 'yes'|'no' } }
  result: null, // { winner, reason, revealedSpyId, locationName }
}

const ACCUSATION_PENALTY_MS = 60000

function shuffled(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function withoutPlayer(players, id) {
  return players.filter((p) => p.id !== id)
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return initialState

    case 'PLAYER_JOINED': {
      const { id, name, isHost } = action.payload
      if (state.players.some((p) => p.id === id)) return state
      return { ...state, players: [...state.players, { id, name, isHost: !!isHost }] }
    }

    case 'PLAYER_LEFT': {
      const { id } = action.payload
      const players = withoutPlayer(state.players, id)

      if (state.phase === PHASE.LOBBY) {
        return { ...state, players }
      }

      if (state.round && id === state.round.spyId) {
        return {
          ...state,
          players,
          phase: PHASE.RESULTS,
          result: {
            winner: 'civili',
            reason: 'spia-abbandona',
            revealedSpyId: id,
            locationName: state.round.locationName,
          },
        }
      }

      if (state.round) {
        const turnOrder = state.round.turnOrder.filter((pid) => pid !== id)
        const currentTurnIndex = state.round.currentTurnIndex % Math.max(turnOrder.length, 1)
        return { ...state, players, round: { ...state.round, turnOrder, currentTurnIndex } }
      }

      return { ...state, players }
    }

    case 'SET_TIMER': {
      if (state.phase !== PHASE.LOBBY) return state
      return { ...state, settings: { ...state.settings, timerMinutes: action.payload.minutes } }
    }

    case 'START_GAME': {
      if (state.phase !== PHASE.LOBBY || state.players.length < 3) return state
      const location = pickLocation()
      const order = shuffled(state.players.map((p) => p.id))
      const spyId = order[Math.floor(Math.random() * order.length)]
      const civilians = state.players.filter((p) => p.id !== spyId)
      const roles = pickRoles(location, civilians.length)
      const assignments = {}
      civilians.forEach((p, i) => {
        assignments[p.id] = roles[i]
      })
      const now = Date.now()
      return {
        ...state,
        phase: PHASE.PLAYING,
        accusation: null,
        result: null,
        round: {
          locationId: location.id,
          locationName: location.name,
          spyId,
          assignments,
          turnOrder: shuffled(order),
          currentTurnIndex: 0,
          clues: [],
          lastVerdict: null,
          startedAt: now,
          endsAt: now + state.settings.timerMinutes * 60000,
        },
      }
    }

    case 'SUBMIT_CLUE': {
      if (state.phase !== PHASE.PLAYING || !state.round) return state
      const { playerId, word } = action.payload
      const currentPlayerId = state.round.turnOrder[state.round.currentTurnIndex]
      if (playerId !== currentPlayerId || !word.trim()) return state
      const player = state.players.find((p) => p.id === playerId)
      const clues = [
        ...state.round.clues,
        { playerId, playerName: player?.name ?? '?', word: word.trim(), ts: Date.now() },
      ]
      const currentTurnIndex = (state.round.currentTurnIndex + 1) % state.round.turnOrder.length
      return { ...state, round: { ...state.round, clues, currentTurnIndex } }
    }

    case 'CALL_ACCUSATION': {
      if (state.phase !== PHASE.PLAYING || !state.round) return state
      const { accuserId, accusedId } = action.payload
      if (accuserId === accusedId) return state
      return {
        ...state,
        phase: PHASE.ACCUSATION,
        accusation: { accuserId, accusedId, votes: { [accuserId]: 'yes' } },
      }
    }

    case 'VOTE_ACCUSATION': {
      if (state.phase !== PHASE.ACCUSATION || !state.accusation) return state
      const { playerId, vote } = action.payload
      if (playerId === state.accusation.accusedId) return state
      const votes = { ...state.accusation.votes, [playerId]: vote }
      const voters = state.players.filter((p) => p.id !== state.accusation.accusedId)
      const allVoted = voters.every((p) => votes[p.id])

      if (!allVoted) {
        return { ...state, accusation: { ...state.accusation, votes } }
      }

      const unanimousYes = voters.every((p) => votes[p.id] === 'yes')
      const { accusedId } = state.accusation
      const accused = state.players.find((p) => p.id === accusedId)

      // Disagreement is the safety valve working as intended: no penalty,
      // nothing is revealed, the group just spent real time talking it over.
      if (!unanimousYes) {
        return {
          ...state,
          phase: PHASE.PLAYING,
          accusation: null,
          round: {
            ...state.round,
            lastVerdict: { accusedName: accused?.name ?? '?', outcome: 'no-consensus', ts: Date.now() },
          },
        }
      }

      // Unanimous but wrong: the whole group misjudged an innocent player
      // together, so the whole group pays for it off the shared clock
      // instead of any one person being singled out or benched.
      if (accusedId !== state.round.spyId) {
        return {
          ...state,
          phase: PHASE.PLAYING,
          accusation: null,
          round: {
            ...state.round,
            endsAt: state.round.endsAt - ACCUSATION_PENALTY_MS,
            lastVerdict: {
              accusedName: accused?.name ?? '?',
              outcome: 'wrong',
              penaltyMs: ACCUSATION_PENALTY_MS,
              ts: Date.now(),
            },
          },
        }
      }

      return { ...state, phase: PHASE.SPY_GUESS }
    }

    case 'SPY_GUESS': {
      const validPhase = state.phase === PHASE.SPY_GUESS || state.phase === PHASE.PLAYING
      if (!validPhase || !state.round) return state
      const { playerId, locationId } = action.payload
      if (playerId !== state.round.spyId) return state
      const correct = locationId === state.round.locationId
      return {
        ...state,
        phase: PHASE.RESULTS,
        result: {
          winner: correct ? 'spia' : 'civili',
          reason: correct ? 'spia-indovina' : 'spia-sbaglia',
          revealedSpyId: state.round.spyId,
          locationName: state.round.locationName,
        },
      }
    }

    case 'TIME_EXPIRED': {
      if (state.phase !== PHASE.PLAYING || !state.round) return state
      return {
        ...state,
        phase: PHASE.RESULTS,
        result: {
          winner: 'spia',
          reason: 'tempo-scaduto',
          revealedSpyId: state.round.spyId,
          locationName: state.round.locationName,
        },
      }
    }

    case 'REMATCH': {
      if (state.phase !== PHASE.RESULTS) return state
      return { ...state, phase: PHASE.LOBBY, round: null, accusation: null, result: null }
    }

    default:
      return state
  }
}
