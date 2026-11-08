import { useEffect, useState } from 'react'

// Aspetto di ogni tipo di evento nel grimorio.
const STYLE = {
  cast: { icon: '🩸', border: 'var(--color-hex)', text: 'var(--color-hex-glow)' },
  denounce: { icon: '⚡', border: 'var(--color-blood)', text: '#ff6b72' },
  purify: { icon: '🧿', border: 'var(--color-venom)', text: 'var(--color-venom)' },
  survive: { icon: '🏵️', border: 'var(--color-ember)', text: 'var(--color-ember)' },
  revoke: { icon: '⛧', border: 'var(--color-parchment-dim)', text: 'var(--color-parchment)' },
  start: { icon: '🔮', border: 'var(--color-hex)', text: 'var(--color-hex-glow)' },
  join: { icon: '✦', border: 'var(--color-ash)', text: 'var(--color-parchment-dim)' },
  leave: { icon: '💨', border: 'var(--color-ash)', text: 'var(--color-parchment-dim)' },
  info: { icon: '·', border: 'var(--color-ash)', text: 'var(--color-parchment-dim)' },
}

function relTime(ts, now) {
  const s = Math.max(0, Math.round((now - ts) / 1000))
  if (s < 5) return 'ora'
  if (s < 60) return `${s}s fa`
  const m = Math.floor(s / 60)
  return `${m}m fa`
}

export default function GrimoireLog({ log }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(iv)
  }, [])

  if (!log?.length) {
    return (
      <p className="text-sm text-[color:var(--color-parchment-dim)] italic font-body">
        Le pagine sono ancora bianche…
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
      {log.map((e) => {
        const s = STYLE[e.kind] ?? STYLE.info
        return (
          <li
            key={e.id}
            className="flex items-start gap-2 rounded-md px-2 py-1.5 bg-[color:var(--color-abyss)]/50"
            style={{ borderLeft: `3px solid ${s.border}` }}
          >
            <span className="text-base leading-5 shrink-0" style={{ color: s.text }}>
              {s.icon}
            </span>
            <span
              className="font-body text-[15px] leading-snug flex-1 min-w-0"
              style={{ color: s.text }}
            >
              {e.text}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-[color:var(--color-parchment-dim)] shrink-0 pt-1">
              {relTime(e.ts, now)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
