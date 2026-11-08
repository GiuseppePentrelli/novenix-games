// interactive=true -> le caselle coperte sono cliccabili e mostrano
// un'anteprima sfumata della risposta (usato dall'host per assegnare i punti
// a colpo d'occhio, senza dover digitare nulla).
export default function Board({ items, revealed, interactive = false, onReveal, justRevealedIndex }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
      {items.map((item, i) => {
        const isRevealed = revealed[i]
        const justRevealed = justRevealedIndex === i
        const baseClasses = 'min-h-[76px] sm:min-h-[96px] rounded-lg border flex flex-col items-center justify-center p-2 text-center overflow-hidden'
        const colorClasses = isRevealed
          ? 'bg-emerald-600 border-emerald-400'
          : interactive
            ? 'bg-slate-700 border-amber-500/50 hover:border-amber-400 hover:bg-slate-600 cursor-pointer'
            : 'bg-slate-700 border-slate-600'

        const content = isRevealed ? (
          <>
            <span
              className="font-semibold text-[11px] sm:text-sm leading-tight break-words hyphens-auto w-full"
              style={{ overflowWrap: 'anywhere' }}
            >
              {item.answer}
            </span>
            <span className="text-[10px] sm:text-xs mt-1 opacity-80">{item.points} pt</span>
          </>
        ) : interactive ? (
          <>
            <span className="text-lg sm:text-xl font-bold text-slate-400">{item.points}</span>
            <span
              className="text-[10px] sm:text-xs mt-1 text-amber-300/70 break-words w-full leading-tight"
              style={{ overflowWrap: 'anywhere' }}
            >
              {item.answer}
            </span>
          </>
        ) : (
          <span className="text-xl sm:text-2xl font-bold text-slate-400">{item.points}</span>
        )

        if (interactive && !isRevealed) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onReveal(i)}
              className={`${baseClasses} ${colorClasses}`}
            >
              {content}
            </button>
          )
        }

        return (
          <div key={i} className={`${baseClasses} ${colorClasses} ${justRevealed ? 'animate-reveal-pop' : ''}`}>
            {content}
          </div>
        )
      })}
    </div>
  )
}
