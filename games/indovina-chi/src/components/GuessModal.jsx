import { useState } from 'react'
import CharacterCard from './CharacterCard'

export default function GuessModal({ characters, onConfirm, onClose }) {
  const [selectedId, setSelectedId] = useState(null)
  const selected = characters.find((c) => c.id === selectedId)

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="card-base flex max-h-[85vh] w-full flex-col gap-4 rounded-b-none p-4 sm:max-w-2xl sm:rounded-b-2xl sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-danger">Chi vuoi indovinare?</h2>
          <button type="button" onClick={onClose} className="text-2xl font-bold text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>

        <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-2 sm:grid-cols-4 sm:gap-4">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              selected={character.id === selectedId}
              onClick={setSelectedId}
              size="sm"
            />
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Annulla
          </button>
          <button
            type="button"
            className="btn-danger"
            disabled={!selected}
            onClick={() => selected && onConfirm(selected.id)}
          >
            {selected ? `Indovina: ${selected.nome}` : 'Seleziona un personaggio'}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400">
          Attenzione: se sbagli, la partita finisce subito con una sconfitta.
        </p>
      </div>
    </div>
  )
}
