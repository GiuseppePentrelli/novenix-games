import CharacterCard from './CharacterCard'

export default function CharacterBoard({ board, onToggle, onViewDetail }) {
  return (
    <div className="grid grid-cols-2 gap-3 p-1 sm:grid-cols-3 sm:gap-4 sm:p-2 md:grid-cols-4 lg:grid-cols-6">
      {board.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          eliminated={character.eliminated}
          onClick={onToggle}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  )
}
