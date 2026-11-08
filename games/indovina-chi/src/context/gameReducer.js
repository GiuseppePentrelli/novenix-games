export const PHASE = {
  LOBBY: 'lobby',
  PICKING: 'picking',
  PLAYING: 'playing',
  ENDED: 'ended',
}

// How long a player has to ask a question (or answer one) before losing
// their turn. Bump this if 45s feels too tight.
export const TURN_DURATION_MS = 45000

let logIdCounter = 0
function nextLogId(prefix) {
  logIdCounter += 1
  return `${prefix}-${logIdCounter}`
}

function turnDeadlineFor(turn) {
  return turn === 'me' ? Date.now() + TURN_DURATION_MS : null
}

export function createInitialState(characters) {
  return {
    phase: PHASE.LOBBY,
    board: characters.map((c) => ({ ...c, eliminated: false })),
    mySecret: null,
    myReady: false,
    opponentReady: false,
    opponentSecretRevealed: null,
    turn: null, // 'me' | 'opponent'
    turnDeadline: null, // timestamp; null when it isn't my active window
    pendingIncomingQuestion: null, // { id, attribute, value, text }
    pendingIncomingGuess: null, // { characterId, characterName, correct }
    awaitingGuessResult: false,
    log: [],
    outcome: null, // 'victory' | 'defeat' | 'opponent-left'
    outcomeReason: null, // 'my-guess-correct' | 'my-guess-wrong' | 'opponent-guessed-me' | 'opponent-guessed-wrong'
  }
}

function upsertAnswer(log, questionId, answer) {
  return log.map((entry) => (entry.id === `q:${questionId}` ? { ...entry, answer } : entry))
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'ENTER_PICKING': {
      const board = state.board.map((c) => ({ ...c, eliminated: false }))
      return {
        ...state,
        phase: PHASE.PICKING,
        board,
        mySecret: null,
        myReady: false,
        opponentReady: false,
        opponentSecretRevealed: null,
        turn: null,
        turnDeadline: null,
        pendingIncomingQuestion: null,
        pendingIncomingGuess: null,
        awaitingGuessResult: false,
        log: [],
        outcome: null,
        outcomeReason: null,
      }
    }

    case 'CONFIRM_SECRET':
      return { ...state, mySecret: action.payload.character, myReady: true }

    case 'OPPONENT_READY':
      return { ...state, opponentReady: true }

    case 'START_PLAYING':
      return {
        ...state,
        phase: PHASE.PLAYING,
        turn: action.payload.turn,
        turnDeadline: turnDeadlineFor(action.payload.turn),
      }

    case 'TOGGLE_ELIMINATED':
      return {
        ...state,
        board: state.board.map((c) =>
          c.id === action.payload.characterId ? { ...c, eliminated: !c.eliminated } : c,
        ),
      }

    case 'ASK_QUESTION': {
      const { question } = action.payload
      return {
        ...state,
        turn: 'opponent',
        turnDeadline: null,
        log: [
          ...state.log,
          { id: `q:${question.id}`, type: 'question', by: 'me', text: question.text, answer: null },
        ],
      }
    }

    case 'RECEIVE_QUESTION': {
      const { question } = action.payload
      return {
        ...state,
        turn: 'me',
        turnDeadline: turnDeadlineFor('me'),
        pendingIncomingQuestion: question,
        log: [
          ...state.log,
          { id: `q:${question.id}`, type: 'question', by: 'opponent', text: question.text, answer: null },
        ],
      }
    }

    case 'ANSWER_SENT':
      return {
        ...state,
        pendingIncomingQuestion: null,
        turnDeadline: turnDeadlineFor('me'),
        log: upsertAnswer(state.log, action.payload.questionId, action.payload.answer),
      }

    case 'RECEIVE_ANSWER':
      return {
        ...state,
        log: upsertAnswer(state.log, action.payload.questionId, action.payload.answer),
      }

    case 'SUBMIT_GUESS':
      return {
        ...state,
        turn: 'opponent',
        turnDeadline: null,
        awaitingGuessResult: true,
        log: [
          ...state.log,
          {
            id: nextLogId('g'),
            type: 'guess',
            by: 'me',
            text: `Hai tentato: ${action.payload.characterName}`,
            correct: null,
          },
        ],
      }

    // The opponent has attempted a guess on my secret. The client already
    // knows the truth (it's my own secret) so the outcome is precomputed
    // here, but the game waits for me to explicitly confirm it — see
    // CONFIRM_GUESS — so no one can silently auto-lose/auto-win without a
    // beat of "reveal" and so the UI can force an honest answer.
    case 'INCOMING_GUESS': {
      const { characterId, characterName, correct } = action.payload
      return {
        ...state,
        turn: 'me',
        turnDeadline: turnDeadlineFor('me'),
        pendingIncomingGuess: { characterId, characterName, correct },
      }
    }

    case 'CONFIRM_GUESS': {
      const pending = state.pendingIncomingGuess
      if (!pending) return state
      return {
        ...state,
        phase: PHASE.ENDED,
        turnDeadline: null,
        pendingIncomingGuess: null,
        outcome: pending.correct ? 'defeat' : 'victory',
        outcomeReason: pending.correct ? 'opponent-guessed-me' : 'opponent-guessed-wrong',
        log: [
          ...state.log,
          {
            id: nextLogId('g'),
            type: 'guess',
            by: 'opponent',
            text: `L'avversario ha tentato: ${pending.characterName}`,
            correct: pending.correct,
          },
        ],
      }
    }

    case 'RECEIVE_GUESS_RESULT': {
      const { correct, opponentSecret } = action.payload
      const log = [...state.log]
      for (let i = log.length - 1; i >= 0; i -= 1) {
        if (log[i].type === 'guess' && log[i].by === 'me' && log[i].correct === null) {
          log[i] = { ...log[i], correct }
          break
        }
      }
      return {
        ...state,
        phase: PHASE.ENDED,
        awaitingGuessResult: false,
        turnDeadline: null,
        outcome: correct ? 'victory' : 'defeat',
        outcomeReason: correct ? 'my-guess-correct' : 'my-guess-wrong',
        opponentSecretRevealed: opponentSecret,
        log,
      }
    }

    case 'OPPONENT_LEFT':
      return {
        ...state,
        phase: PHASE.ENDED,
        turnDeadline: null,
        outcome: 'opponent-left',
      }

    case 'SELF_TIMEOUT': {
      const pending = state.pendingIncomingQuestion
      const log = pending
        ? upsertAnswer(state.log, pending.id, 'timeout')
        : [...state.log, { id: nextLogId('t'), type: 'timeout', by: 'me', text: 'Hai lasciato scadere il turno' }]
      return { ...state, pendingIncomingQuestion: null, turn: 'opponent', turnDeadline: null, log }
    }

    case 'RECEIVE_TIMEOUT': {
      const { questionId } = action.payload
      const log = questionId
        ? upsertAnswer(state.log, questionId, 'timeout')
        : [
            ...state.log,
            { id: nextLogId('t'), type: 'timeout', by: 'opponent', text: "L'avversario ha lasciato scadere il turno" },
          ]
      return { ...state, turn: 'me', turnDeadline: turnDeadlineFor('me'), log }
    }

    default:
      return state
  }
}
