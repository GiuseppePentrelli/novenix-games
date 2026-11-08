import SalaLink from './SalaLink.jsx'

const MEDALS = ['🥇', '🥈', '🥉']

export default function FinalRanking({ state, onNewGame, onBack, canUndo }) {
  const ranked = Object.values(state.players).sort((a, b) => b.points - a.points)
  const top = ranked[0]?.points
  const winners = ranked.filter((p) => p.points === top)

  return (
    <div className="min-h-svh flex flex-col items-center px-5 py-5">
      <div className="w-full max-w-md">
        <SalaLink />
      </div>
      <div className="flex flex-col items-center gap-2 my-8 text-center">
        <div className="text-5xl flicker">🏆</div>
        <h1 className="font-grimoire text-4xl text-hex-glow">Il rito è compiuto</h1>
        <p className="font-body italic text-lg text-[color:var(--color-parchment-dim)]">
          {winners.length > 1
            ? `Pari merito: ${winners.map((p) => p.name).join(' e ')}`
            : `${winners[0]?.avatar} ${winners[0]?.name} domina il cerchio`}
        </p>
      </div>

      <ol className="grimoire-panel w-full max-w-md p-5 flex flex-col gap-2">
        {ranked.map((p, i) => (
          <li
            key={p.id}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border ${
              p.points === top ? 'border-[color:var(--color-hex)] bg-[color:var(--color-hex)]/10' : 'border-[color:var(--color-ash)]'
            }`}
          >
            <span className="w-8 text-center font-grimoire text-[color:var(--color-parchment-dim)]">
              {MEDALS[i] ?? `${i + 1}°`}
            </span>
            <span className="text-2xl">{p.avatar}</span>
            <span className="font-body text-lg flex-1 truncate">{p.name}</span>
            <span className="font-grimoire text-2xl text-hex-glow">{p.points}</span>
          </li>
        ))}
      </ol>

      <div className="w-full max-w-md flex flex-col gap-2 mt-6">
        <button className="sigil-btn blood text-lg" onClick={onNewGame}>
          🔮 Nuovo rito
        </button>
        {canUndo && (
          <button className="sigil-btn" onClick={onBack}>
            ↶ Riprendi il rito
          </button>
        )}
      </div>
    </div>
  )
}
