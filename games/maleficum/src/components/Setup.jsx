import { useState } from 'react'
import { MAX_PLAYERS, MIN_PLAYERS } from '../game/state.js'
import { START_POINTS } from '../game/rules.js'
import HelpOverlay from './HelpOverlay.jsx'
import SalaLink from './SalaLink.jsx'

const placeholder = (i) => `Anima ${i + 1}`

// L'Officiante sceglie quante anime entrano nel cerchio e come si chiamano.
export default function Setup({ lastNames, onStart }) {
  const [names, setNames] = useState(() =>
    lastNames?.length >= MIN_PLAYERS ? [...lastNames] : Array(4).fill('')
  )
  const [showHelp, setShowHelp] = useState(false)

  const setCount = (count) =>
    setNames((prev) =>
      count > prev.length ? [...prev, ...Array(count - prev.length).fill('')] : prev.slice(0, count)
    )
  const rename = (index, value) =>
    setNames((prev) => prev.map((name, i) => (i === index ? value : name)))

  return (
    <div className="min-h-svh flex flex-col items-center px-5 py-5">
      <div className="w-full max-w-md flex items-center justify-between">
        <SalaLink />
        <button
          onClick={() => setShowHelp(true)}
          className="w-8 h-8 rounded-full border border-[color:var(--color-ash)] text-[color:var(--color-parchment-dim)] hover:text-hex-glow hover:border-[color:var(--color-hex)] transition-colors"
          aria-label="Come si gioca"
        >
          ?
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 my-8 text-center">
        <div className="text-5xl flicker mb-1">🕯️</div>
        <h1 className="font-grimoire text-5xl md:text-6xl text-hex-glow">Maleficum</h1>
        <p className="font-body italic text-[color:var(--color-parchment-dim)] text-lg">
          Il grimorio delle maledizioni
        </p>
      </div>

      <div className="grimoire-panel w-full max-w-md p-6 flex flex-col gap-5">
        <p className="font-body italic text-center text-[color:var(--color-parchment-dim)]">
          Tu sei l'Officiante: tieni il telefono, giudichi le prove e segni i punti.
        </p>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)]">
            Anime nel cerchio
          </span>
          <div className="flex items-center gap-3">
            <button
              className="sigil-btn !px-0 !py-0 w-10 h-10 text-xl"
              disabled={names.length <= MIN_PLAYERS}
              onClick={() => setCount(names.length - 1)}
              aria-label="Una anima in meno"
            >
              −
            </button>
            <span className="font-grimoire text-3xl text-hex-glow w-10 text-center" aria-live="polite">
              {names.length}
            </span>
            <button
              className="sigil-btn !px-0 !py-0 w-10 h-10 text-xl"
              disabled={names.length >= MAX_PLAYERS}
              onClick={() => setCount(names.length + 1)}
              aria-label="Una anima in più"
            >
              +
            </button>
          </div>
        </div>

        <ol className="flex flex-col gap-2">
          {names.map((name, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-5 text-right font-grimoire text-[color:var(--color-parchment-dim)]">{i + 1}</span>
              <input
                value={name}
                onChange={(e) => rename(i, e.target.value)}
                maxLength={16}
                placeholder={placeholder(i)}
                aria-label={`Nome dell'anima ${i + 1}`}
                className="flex-1 min-w-0 bg-[color:var(--color-abyss)] border border-[color:var(--color-ash)] rounded-lg px-4 py-2.5 text-lg text-[color:var(--color-parchment)] outline-none focus:border-[color:var(--color-hex)] transition-colors"
              />
            </li>
          ))}
        </ol>

        <p className="text-xs text-center font-body text-[color:var(--color-parchment-dim)]">
          Ogni anima parte da {START_POINTS} punti. I dadi decidono l'ordine dei turni.
        </p>

        <button
          className="sigil-btn blood text-lg flicker"
          onClick={() => onStart(names.map((name, i) => name.trim() || placeholder(i)))}
        >
          🎲 Tira i dadi e inizia il rito
        </button>
      </div>

      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
    </div>
  )
}
