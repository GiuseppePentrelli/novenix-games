import { useRef, useState } from 'react'

// Schermata iniziale: evoca o unisciti a una stanza.
export default function Lobby({ status, error, onHost, onJoin, onDemo }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [mode, setMode] = useState(null) // 'host' | 'join'
  const [hint, setHint] = useState(null) // messaggio di validazione locale
  const nameRef = useRef(null)

  const busy = status === 'hosting' || status === 'joining'

  const requireName = () => {
    if (name.trim()) return true
    setHint('Scrivi prima il tuo nome da iniziato.')
    nameRef.current?.focus()
    return false
  }

  const tryHost = () => {
    if (busy) return
    if (!requireName()) return
    setHint(null)
    setMode('host')
    onHost(name.trim())
  }

  const tryJoin = () => {
    if (busy) return
    if (!requireName()) return
    if (code.trim().length < 4) {
      setHint('Serve il codice a 4 rune della stanza.')
      return
    }
    setHint(null)
    setMode('join')
    onJoin(code.trim(), name.trim())
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-10">
      <div className="flex flex-col items-center gap-2 mb-10 text-center">
        <div className="text-5xl flicker mb-2">🕯️</div>
        <h1 className="font-grimoire text-5xl md:text-6xl text-hex-glow">Maleficum</h1>
        <p className="font-body italic text-[color:var(--color-parchment-dim)] text-lg">
          Il grimorio delle maledizioni
        </p>
      </div>

      <div className="grimoire-panel w-full max-w-md p-7 flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)]">
            Il tuo nome da iniziato
          </span>
          <input
            ref={nameRef}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (hint) setHint(null)
            }}
            maxLength={16}
            placeholder="es. Morgana"
            className="bg-[color:var(--color-abyss)] border border-[color:var(--color-ash)] rounded-lg px-4 py-3 text-lg text-[color:var(--color-parchment)] outline-none focus:border-[color:var(--color-hex)] transition-colors"
          />
        </label>

        {mode !== 'join' && (
          <button className="sigil-btn text-lg" onClick={tryHost}>
            {status === 'hosting' ? 'Evocazione…' : '🔮 Evoca una stanza'}
          </button>
        )}

        {mode !== 'host' && (
          <>
            <div className="flex items-center gap-3 text-[color:var(--color-parchment-dim)] text-xs uppercase tracking-widest">
              <span className="flex-1 h-px bg-[color:var(--color-ash)]" />
              oppure
              <span className="flex-1 h-px bg-[color:var(--color-ash)]" />
            </div>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  if (hint) setHint(null)
                }}
                onKeyDown={(e) => e.key === 'Enter' && tryJoin()}
                maxLength={4}
                placeholder="CODICE"
                className="w-32 bg-[color:var(--color-abyss)] border border-[color:var(--color-ash)] rounded-lg px-4 py-3 text-lg tracking-[0.3em] text-center font-grimoire text-[color:var(--color-parchment)] outline-none focus:border-[color:var(--color-venom)] transition-colors"
              />
              <button className="sigil-btn venom flex-1" onClick={tryJoin}>
                {status === 'joining' ? 'Rito…' : 'Unisciti'}
              </button>
            </div>
          </>
        )}

        {hint && (
          <p className="text-[color:var(--color-ember)] text-sm text-center font-body">
            ⚠ {hint}
          </p>
        )}
        {error && (
          <p className="text-[color:var(--color-blood)] text-sm text-center font-body">
            ⚠ {error}
          </p>
        )}
        {(mode || error) && !busy && (
          <button
            className="text-xs text-[color:var(--color-parchment-dim)] underline"
            onClick={() => {
              setMode(null)
              setHint(null)
              setCode('')
            }}
          >
            ← indietro
          </button>
        )}
      </div>

      <p className="mt-8 text-xs text-[color:var(--color-parchment-dim)] max-w-sm text-center font-body italic">
        Chi evoca la stanza diventa l’Officiante e custodisce il rito. Gli altri
        entrano col codice a 4 rune.
      </p>

      {onDemo && (
        <button
          onClick={onDemo}
          className="mt-6 text-xs text-[color:var(--color-parchment-dim)] hover:text-[color:var(--color-ember)] underline transition-colors"
        >
          👁 Anteprima del gioco (demo locale, senza rete)
        </button>
      )}
    </div>
  )
}
