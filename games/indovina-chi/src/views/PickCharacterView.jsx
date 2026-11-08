import { useState } from 'react'
import { useGame } from '../context/GameContext'
import CharacterCard from '../components/CharacterCard'

export default function PickCharacterView() {
  const { characters, state, confirmSecret } = useGame()
  const [selectedId, setSelectedId] = useState(null)

  if (state.myReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-4">
        <div className="card-base flex flex-col items-center gap-3 p-8 text-center">
          <img
            src={state.mySecret.img}
            alt={state.mySecret.nome}
            className="h-20 w-20 rounded-2xl object-cover shadow-card"
          />
          <p className="text-xl font-extrabold text-primary">Hai scelto: {state.mySecret.nome}</p>
          <p className="animate-pulse text-sm text-gray-500">
            In attesa che l'avversario scelga il suo personaggio...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-4 p-4">
      <h1 className="text-center text-2xl font-extrabold text-primary sm:text-3xl">
        Scegli il tuo personaggio segreto
      </h1>
      <p className="text-center text-sm text-gray-500">
        L'avversario dovrà indovinarlo facendoti domande a Sì/No.
      </p>

      <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-2 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            selected={character.id === selectedId}
            onClick={setSelectedId}
          />
        ))}
      </div>

      <button
        type="button"
        className="btn-primary"
        disabled={!selectedId}
        onClick={() => confirmSecret(selectedId)}
      >
        Conferma personaggio
      </button>
    </div>
  )
}
