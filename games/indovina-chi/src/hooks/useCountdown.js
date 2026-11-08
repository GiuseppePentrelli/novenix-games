import { useEffect, useState } from 'react'

// Returns remaining whole seconds until `deadline` (a timestamp), or null if
// there's no active deadline. Ticks every 250ms for a smooth-ish display.
export function useCountdown(deadline) {
  const [remaining, setRemaining] = useState(null)

  useEffect(() => {
    if (!deadline) {
      setRemaining(null)
      return undefined
    }
    const update = () => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)))
    update()
    const id = setInterval(update, 250)
    return () => clearInterval(id)
  }, [deadline])

  return remaining
}
