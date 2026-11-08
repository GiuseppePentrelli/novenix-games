import { useState } from 'react'
import { describeCharacter } from '../lib/characterInfo'

export default function CharacterDetailModal({ character, onClose }) {
  const [flipped, setFlipped] = useState(false)
  if (!character) return null

  const lines = describeCharacter(character)

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="h-[65vh] max-h-[520px] w-[85vw] max-w-sm"
        style={{ perspective: '1200px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative h-full w-full cursor-pointer transition-transform duration-500"
          style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none' }}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* front */}
          <div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary via-accent to-primary p-1.5 shadow-popup"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[1.35rem] bg-white">
              <img src={character.img} alt={character.nome} className="h-full w-full object-cover" />
              <p className="absolute inset-x-0 bottom-0 bg-black/60 py-3 text-center text-2xl font-extrabold text-white">
                {character.nome}
              </p>
            </div>
          </div>

          {/* back */}
          <div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary via-accent to-primary p-1.5 shadow-popup"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 overflow-y-auto rounded-[1.35rem] bg-board p-6">
              <p className="text-2xl font-extrabold text-primary">{character.nome}</p>

              {character.eliminated !== undefined && (
                <span
                  className={[
                    'rounded-full px-4 py-1 text-sm font-bold uppercase tracking-wide text-white',
                    character.eliminated ? 'bg-danger' : 'bg-success',
                  ].join(' ')}
                >
                  {character.eliminated ? 'Escluso' : 'Non escluso'}
                </span>
              )}

              <ul className="flex flex-col gap-2">
                {lines.map((line) => (
                  <li
                    key={line.key}
                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-base font-bold text-primary-dark shadow-card"
                  >
                    <span aria-hidden="true">{line.icon}</span>
                    <span>{line.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-white/70">Tocca la carta per girarla</p>
      <button type="button" className="btn-secondary" onClick={onClose}>
        Chiudi
      </button>
    </div>
  )
}
