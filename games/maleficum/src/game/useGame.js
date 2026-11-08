import { useCallback, useEffect, useState } from 'react'
import { createInitialState, gameReducer, STATE_VERSION } from './state.js'

const STORAGE_KEY = 'maleficum:rito'
const UNDO_LIMIT = 50
// Azioni che cambiano solo ciò che si vede: non occupano un passo di «Annulla».
const QUIET = new Set(['DISMISS_REVEAL'])

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.version === STATE_VERSION && ['setup', 'playing', 'ended'].includes(saved.phase)) return saved
    if (saved?.players) {
      const names = saved.lastNames?.length ? saved.lastNames : Object.values(saved.players).map((p) => p.name)
      return createInitialState(names)
    }
  } catch {}
  return createInitialState()
}

export function useGame() {
  const [history, setHistory] = useState(() => ({ past: [], present: load() }))

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.present))
    } catch {}
  }, [history.present])

  const dispatch = useCallback((action) => {
    setHistory((h) => {
      const next = gameReducer(h.present, action)
      if (next === h.present) return h
      if (action.type === 'RESET') return { past: [], present: next }
      if (QUIET.has(action.type)) return { ...h, present: next }
      return { past: [...h.past.slice(-(UNDO_LIMIT - 1)), h.present], present: next }
    })
  }, [])

  const undo = useCallback(() => {
    setHistory((h) =>
      h.past.length ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1] } : h
    )
  }, [])

  return { state: history.present, dispatch, undo, canUndo: history.past.length > 0 }
}
