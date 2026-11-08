import { useCallback, useEffect, useRef, useState } from 'react'
import characters from '../data/characters.json'
import { deriveQuestions, matchesQuestion } from '../lib/questions'

const questions = deriveQuestions(characters)
const MIN_THINK_MS = 500
const MAX_THINK_MS = 1200

function thinkDelay() {
  return MIN_THINK_MS + Math.random() * (MAX_THINK_MS - MIN_THINK_MS)
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

// Exposes the exact same shape as usePeerConnection (status, isHost, send,
// onMessage, hostRoom, disconnect...) so GameContext can treat a local CPU
// opponent as just another transport, reusing every view/reducer untouched.
export function useCpuConnection() {
  const [status, setStatus] = useState('idle')

  const listenersRef = useRef(new Set())
  const brainRef = useRef(null)
  const timeoutsRef = useRef([])

  const emit = useCallback((message) => {
    listenersRef.current.forEach((handler) => handler(message))
  }, [])

  const schedule = useCallback((fn, delay) => {
    const id = setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== id)
      fn()
    }, delay)
    timeoutsRef.current.push(id)
  }, [])

  const clearScheduled = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  const resetBrain = useCallback(() => {
    brainRef.current = {
      secret: pickRandom(characters),
      candidates: [...characters],
      askedQuestionIds: new Set(),
    }
  }, [])

  const cpuTakeTurn = useCallback(() => {
    const brain = brainRef.current
    const { candidates } = brain

    const shouldGuess = candidates.length === 1 || (candidates.length <= 2 && Math.random() < 0.6)
    const unusedQuestions = questions.filter((q) => !brain.askedQuestionIds.has(q.id))

    if (shouldGuess || unusedQuestions.length === 0) {
      const target = pickRandom(candidates)
      schedule(() => emit({ type: 'GUESS', payload: { characterId: target.id, characterName: target.nome } }), thinkDelay())
      return
    }

    let best = unusedQuestions[0]
    let bestScore = Infinity
    unusedQuestions.forEach((q) => {
      const matchCount = candidates.filter((c) => matchesQuestion(c, q)).length
      const score = Math.abs(matchCount - candidates.length / 2)
      if (score < bestScore) {
        bestScore = score
        best = q
      }
    })

    brain.askedQuestionIds.add(best.id)
    schedule(() => emit({ type: 'QUESTION', payload: best }), thinkDelay())
  }, [emit, schedule])

  const handleFromPlayer = useCallback(
    (message) => {
      const brain = brainRef.current
      switch (message.type) {
        case 'GAME_START': {
          if (message.payload.firstTurn === 'guest') {
            schedule(cpuTakeTurn, thinkDelay())
          }
          break
        }
        case 'QUESTION': {
          const question = message.payload
          const answer = matchesQuestion(brain.secret, question)
          schedule(() => {
            emit({ type: 'ANSWER', payload: { questionId: question.id, answer } })
            schedule(cpuTakeTurn, thinkDelay())
          }, thinkDelay())
          break
        }
        case 'ANSWER': {
          const { questionId, answer } = message.payload
          const question = questions.find((q) => q.id === questionId)
          if (question) {
            brain.candidates = brain.candidates.filter((c) =>
              answer ? matchesQuestion(c, question) : !matchesQuestion(c, question),
            )
          }
          break
        }
        case 'GUESS': {
          const { characterId } = message.payload
          const correct = characterId === brain.secret.id
          schedule(() => emit({ type: 'GUESS_RESULT', payload: { correct, opponentSecret: brain.secret } }), thinkDelay())
          break
        }
        case 'TURN_TIMEOUT': {
          schedule(cpuTakeTurn, thinkDelay())
          break
        }
        case 'REMATCH_REQUEST': {
          resetBrain()
          schedule(() => emit({ type: 'PLAYER_READY', payload: {} }), thinkDelay())
          break
        }
        default:
          break
      }
    },
    [cpuTakeTurn, emit, resetBrain, schedule],
  )

  const hostRoom = useCallback(() => {
    resetBrain()
    setStatus('connected')
    schedule(() => emit({ type: 'PLAYER_READY', payload: {} }), thinkDelay())
  }, [emit, resetBrain, schedule])

  const send = useCallback(
    (message) => {
      handleFromPlayer(message)
    },
    [handleFromPlayer],
  )

  const onMessage = useCallback((handler) => {
    listenersRef.current.add(handler)
    return () => listenersRef.current.delete(handler)
  }, [])

  const disconnect = useCallback(() => {
    clearScheduled()
    setStatus('idle')
  }, [])

  useEffect(() => () => clearScheduled(), [])

  return {
    status,
    roomCode: '',
    isHost: true,
    error: '',
    hostRoom,
    joinRoom: () => {},
    send,
    onMessage,
    disconnect,
  }
}
