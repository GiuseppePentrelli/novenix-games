import { useEffect, useReducer, useRef } from 'react'
import { categories } from '../data/categories.js'
import { isMatch } from '../utils/match.js'
import { saveState } from '../utils/storage.js'

export const TURN_SECONDS = 30
export const TOTAL_ROUNDS = 5
const OTHER_TEAM = { A: 'B', B: 'A' }
let feedbackId = 0

function makeRevealed(items) {
  return items.map(() => false)
}

function randomUnusedIndex(used) {
  const pool = categories.map((_, i) => i).filter((i) => !used.includes(i))
  const finalPool = pool.length > 0 ? pool : categories.map((_, i) => i)
  return finalPool[Math.floor(Math.random() * finalPool.length)]
}

function freshRoundFields(categoryIndex) {
  return {
    categoryIndex,
    revealed: makeRevealed(categories[categoryIndex].items),
    currentTeam: 'A',
    timeLeft: TURN_SECONDS,
    timerRunning: true,
    feedback: null,
    pending: null,
    justRevealedIndex: null,
  }
}

export function makeInitialState({ teamNames, mode }) {
  const categoryIndex = randomUnusedIndex([])
  return {
    teamNames,
    mode,
    matchRound: 1,
    usedCategoryIndexes: [categoryIndex],
    scores: { A: 0, B: 0 },
    ...freshRoundFields(categoryIndex),
  }
}

function reveal(state, index) {
  const item = categories[state.categoryIndex].items[index]
  const revealed = [...state.revealed]
  revealed[index] = true
  return {
    ...state,
    revealed,
    scores: { ...state.scores, [state.currentTeam]: state.scores[state.currentTeam] + item.points },
    justRevealedIndex: index,
    pending: null,
    timerRunning: true,
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'TICK':
      return { ...state, timeLeft: state.timeLeft - 1 }

    case 'SWITCH_TEAM':
      return {
        ...state,
        currentTeam: OTHER_TEAM[state.currentTeam],
        timeLeft: TURN_SECONDS,
        timerRunning: true,
        pending: null,
        feedback: {
          id: ++feedbackId,
          type: 'wrong',
          text: action.reason === 'timeout' ? 'Tempo scaduto! Cambio turno.' : 'Risposta sbagliata. Cambio turno.',
        },
      }

    case 'REVEAL': {
      const item = categories[state.categoryIndex].items[action.index]
      return {
        ...reveal(state, action.index),
        feedback: { id: ++feedbackId, type: 'correct', text: `"${item.answer}" vale ${item.points} punti.` },
      }
    }

    case 'ALREADY_REVEALED':
      return {
        ...state,
        feedback: { id: ++feedbackId, type: 'already', text: 'Risposta gia\' scoperta: nessun punto, il timer continua.' },
      }

    case 'SET_PENDING':
      return {
        ...state,
        timerRunning: false,
        pending: { guessText: action.guessText },
        feedback: { id: ++feedbackId, type: 'unrecognized', text: `Risposta "${action.guessText}" non riconosciuta.` },
      }

    case 'CANCEL_PENDING':
      return { ...state, pending: null, timerRunning: true }

    case 'CHANGE_CATEGORY':
      return { ...state, ...freshRoundFields(action.index) }

    case 'NEXT_CATEGORY': {
      const nextIndex = randomUnusedIndex(state.usedCategoryIndexes)
      return {
        ...state,
        matchRound: state.matchRound + 1,
        usedCategoryIndexes: [...state.usedCategoryIndexes, nextIndex],
        ...freshRoundFields(nextIndex),
      }
    }

    case 'NEW_MATCH': {
      const nextIndex = randomUnusedIndex([])
      return {
        ...state,
        matchRound: 1,
        usedCategoryIndexes: [nextIndex],
        scores: { A: 0, B: 0 },
        ...freshRoundFields(nextIndex),
      }
    }

    default:
      return state
  }
}

export function useGameEngine(initialState) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const roundOver = state.revealed.every(Boolean)

  // persistenza + sincronizzazione con la schermata giocatori
  useEffect(() => {
    saveState({ phase: 'playing', ...state })
  }, [state])

  // countdown del turno
  useEffect(() => {
    if (!state.timerRunning || roundOver || state.pending) return
    if (state.timeLeft <= 0) {
      dispatch({ type: 'SWITCH_TEAM', reason: 'timeout' })
      return
    }
    const id = setTimeout(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearTimeout(id)
  }, [state.timeLeft, state.timerRunning, state.pending, roundOver])

  const category = categories[state.categoryIndex]

  function revealCorrect(index) {
    dispatch({ type: 'REVEAL', index })
  }

  function submitGuess(text) {
    if (roundOver || state.pending) return
    const trimmed = text.trim()
    if (!trimmed) return

    const hiddenIndex = category.items.findIndex((item, i) => !state.revealed[i] && isMatch(trimmed, item))
    if (hiddenIndex !== -1) {
      revealCorrect(hiddenIndex)
      return
    }

    const alreadyIndex = category.items.findIndex((item, i) => state.revealed[i] && isMatch(trimmed, item))
    if (alreadyIndex !== -1) {
      dispatch({ type: 'ALREADY_REVEALED' })
      return
    }

    dispatch({ type: 'SET_PENDING', guessText: trimmed })
  }

  return {
    state,
    category,
    roundOver,
    revealCorrect,
    submitGuess,
    switchTeam: (reason) => dispatch({ type: 'SWITCH_TEAM', reason }),
    cancelPending: () => dispatch({ type: 'CANCEL_PENDING' }),
    changeCategory: (index) => dispatch({ type: 'CHANGE_CATEGORY', index }),
    nextCategory: () => dispatch({ type: 'NEXT_CATEGORY' }),
    newMatch: () => dispatch({ type: 'NEW_MATCH' }),
  }
}
