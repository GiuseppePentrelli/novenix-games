import { useState } from 'react'
import Logo from './Logo.jsx'

export default function SetupScreen({ onStart, hasSavedGame, onContinue }) {
  const [nameA, setNameA] = useState('Squadra A')
  const [nameB, setNameB] = useState('Squadra B')
  const [mode, setMode] = useState('host')

  function handleSubmit(e) {
    e.preventDefault()
    onStart({
      teamNames: { A: nameA.trim() || 'Squadra A', B: nameB.trim() || 'Squadra B' },
      mode,
    })
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md flex flex-col gap-6">
        <Logo subtitle="Indovina la classifica, casella per casella" />

        {hasSavedGame && (
          <button
            type="button"
            onClick={onContinue}
            className="rounded-lg border border-emerald-500 bg-emerald-950/40 px-4 py-3 text-emerald-200 hover:bg-emerald-950/70"
          >
            Continua partita salvata
          </button>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-800/40 p-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-400 mb-1">Nome squadra 1</label>
            <input
              type="text"
              value={nameA}
              onChange={(e) => setNameA(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 focus:outline-none focus:border-emerald-400"
              maxLength={24}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-400 mb-1">Nome squadra 2</label>
            <input
              type="text"
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 focus:outline-none focus:border-emerald-400"
              maxLength={24}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Modalita'</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('host')}
                className={`rounded-lg border px-3 py-2 text-sm text-left ${
                  mode === 'host' ? 'border-emerald-400 bg-emerald-950/40' : 'border-slate-600 bg-slate-900'
                }`}
              >
                <span className="font-semibold block">Con host</span>
                <span className="text-slate-400 text-xs">Qualcuno gestisce il tabellone e assegna i punti</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('classic')}
                className={`rounded-lg border px-3 py-2 text-sm text-left ${
                  mode === 'classic' ? 'border-emerald-400 bg-emerald-950/40' : 'border-slate-600 bg-slate-900'
                }`}
              >
                <span className="font-semibold block">Senza host</span>
                <span className="text-slate-400 text-xs">Le squadre rispondono digitando, il sistema controlla</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-emerald-500 hover:bg-emerald-400 px-6 py-3 font-semibold text-slate-900"
          >
            Inizia partita
          </button>
        </form>
      </div>
    </div>
  )
}
