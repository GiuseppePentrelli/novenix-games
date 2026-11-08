const STYLES = {
  correct: 'bg-emerald-900/50 border-emerald-500 text-emerald-200',
  wrong: 'bg-red-900/50 border-red-500 text-red-200',
  already: 'bg-amber-900/50 border-amber-500 text-amber-200',
  unrecognized: 'bg-slate-700/60 border-slate-500 text-slate-200',
}

const ANIM = {
  correct: 'animate-correct-pulse',
  wrong: 'animate-shake',
}

export default function FeedbackBanner({ feedback }) {
  // la key cambia ad ogni nuovo evento cosi' l'animazione riparte sempre
  return (
    <div
      key={feedback.id}
      className={`rounded-lg border px-4 py-3 text-center break-words ${STYLES[feedback.type]} ${ANIM[feedback.type] || ''}`}
    >
      {feedback.text}
    </div>
  )
}
