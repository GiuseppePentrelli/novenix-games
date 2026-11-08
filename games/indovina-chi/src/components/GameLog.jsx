export default function GameLog({ log }) {
  return (
    <div className="card-base flex max-h-64 flex-col gap-2 overflow-y-auto p-4 lg:max-h-[28rem]">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Cronologia</p>
      {log.length === 0 && <p className="text-sm text-gray-400">Nessuna domanda ancora.</p>}
      <ul className="flex flex-col gap-2">
        {log.map((entry) => {
          if (entry.type === 'timeout') {
            return (
              <li key={entry.id} className="rounded-xl bg-gray-100 px-3 py-2 text-sm italic text-gray-500">
                ⏱ {entry.text}
              </li>
            )
          }

          return (
            <li key={entry.id} className="rounded-xl bg-primary-light/10 px-3 py-2 text-sm">
              <span className="font-bold">{entry.by === 'me' ? 'Tu' : 'Avversario'}:</span> {entry.text}
              {entry.type === 'question' && entry.answer !== null && entry.answer !== 'timeout' && (
                <span className={entry.answer ? 'ml-1 font-bold text-success' : 'ml-1 font-bold text-danger'}>
                  {entry.answer ? 'Sì' : 'No'}
                </span>
              )}
              {entry.type === 'question' && entry.answer === 'timeout' && (
                <span className="ml-1 font-bold italic text-gray-400">tempo scaduto</span>
              )}
              {entry.type === 'guess' && entry.correct !== null && (
                <span className={entry.correct ? 'ml-1 font-bold text-success' : 'ml-1 font-bold text-danger'}>
                  {entry.correct ? 'Corretto!' : 'Sbagliato'}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
