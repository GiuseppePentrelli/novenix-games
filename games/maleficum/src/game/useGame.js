import { useCallback, useEffect, useState } from 'react'
import { createInitialState, gameReducer } from './state.js'

const STORAGE_KEY = 'maleficum:rito'
const UNDO_LIMIT = 50

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && ['setup', 'playing', 'ended'].includes(saved.phase) && saved.players) return saved
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
