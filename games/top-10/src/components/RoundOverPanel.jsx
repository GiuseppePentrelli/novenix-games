const TOTAL_ROUNDS = 5

export default function RoundOverPanel({ scores, teamNames, matchRound, onNextCategory, onNewMatch }) {
  const isLastRound = matchRound >= TOTAL_ROUNDS
  const winner = scores.A === scores.B ? null : scores.A > scores.B ? 'A' : 'B'

  return (
    <div className="rounded-xl border border-slate-600 bg-slate-800 p-6 text-center flex flex-col gap-4 animate-correct-pulse">
      <h2 className="text-2xl font-bold">
        {isLastRound ? 'Partita finita!' : `Tabellone completo! (Categoria ${matchRound} di ${TOTAL_ROUNDS})`}
      </h2>
      <p className="text-lg break-words">
        {winner
          ? `${teamNames[winner]} ${isLastRound ? 'vince la partita' : 'e\' in vantaggio'} ${scores.A} - ${scores.B}`
          : `Pareggio ${scores.A} - ${scores.B}`}
      </p>
      {isLastRound ? (
        <button
          type="button"
          onClick={onNewMatch}
          className="self-center rounded-lg bg-emerald-500 hover:bg-emerald-400 px-6 py-3 font-semibold text-slate-900"
        >
          Nuova partita
        </button>
      ) : (
        <button
          type="button"
          onClick={onNextCategory}
          className="self-center rounded-lg bg-emerald-500 hover:bg-emerald-400 px-6 py-3 font-semibold text-slate-900"
        >
          Prossima categoria
        </button>
      )}
    </div>
  )
}
