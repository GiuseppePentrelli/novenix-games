import { useState } from 'react'

export default function QuestionPanel({ questions, disabled, onAsk, onOpenGuess, allowCustom = false }) {
  const [selectedId, setSelectedId] = useState('')
  const [customText, setCustomText] = useState('')

  const handlePickSuggestion = (id) => {
    setSelectedId(id)
    const question = questions.find((q) => q.id === id)
    if (!question) return
    if (allowCustom) {
      setCustomText(question.text)
    }
  }

  const handleAsk = () => {
    if (allowCustom) {
      const trimmed = customText.trim()
      if (!trimmed) return
      const text = trimmed.endsWith('?') ? trimmed : `${trimmed}?`
      onAsk({ id: `custom-${Date.now()}`, text })
      setCustomText('')
      setSelectedId('')
      return
    }
    const question = questions.find((q) => q.id === selectedId) ?? questions[0]
    if (question) onAsk(question)
  }

  const canSend = allowCustom ? customText.trim().length > 0 : selectedId !== ''

  return (
    <div className="card-base flex flex-col gap-3 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Fai una domanda</p>

      {allowCustom && (
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          disabled={disabled}
          placeholder="Scrivi la tua domanda..."
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 font-semibold disabled:opacity-50"
        />
      )}

      <select
        value={selectedId}
        onChange={(e) => handlePickSuggestion(e.target.value)}
        disabled={disabled}
        className={
          allowCustom
            ? 'w-full rounded-xl border-2 border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-500 disabled:opacity-50'
            : 'w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 font-semibold disabled:opacity-50'
        }
      >
        <option value="" disabled>
          {allowCustom ? 'Suggerimenti...' : 'Scegli una domanda'}
        </option>
        {questions.map((q) => (
          <option key={q.id} value={q.id}>
            {q.text}
          </option>
        ))}
      </select>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn-primary flex-1" disabled={disabled || !canSend} onClick={handleAsk}>
          Chiedi
        </button>
        <button type="button" className="btn-danger flex-1" disabled={disabled} onClick={onOpenGuess}>
          Indovina
        </button>
      </div>
    </div>
  )
}
