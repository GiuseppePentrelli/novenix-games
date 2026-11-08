export default function TeamPanels({ teamNames, scores, currentTeam, timeLeft, roundOver }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {['A', 'B'].map((team) => {
        const active = team === currentTeam && !roundOver
        return (
          <div
            key={team}
            className={`rounded-xl border-2 p-3 sm:p-4 text-center transition-colors min-w-0 ${
              active ? 'border-emerald-400 bg-emerald-950/40' : 'border-slate-700 bg-slate-800/40'
            }`}
          >
            <p className="text-xs sm:text-sm uppercase tracking-widest text-slate-300 truncate">
              {teamNames[team]}
            </p>
            <p className="text-3xl sm:text-4xl font-bold mt-1">{scores[team]}</p>
            {active && (
              <p className={`mt-2 text-xl sm:text-2xl font-mono ${timeLeft <= 10 ? 'text-red-400' : 'text-emerald-300'}`}>
                {timeLeft}s
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
