export default function SecretBadge({ character, onClick }) {
  if (!character) return null

  return (
    <button
      type="button"
      onClick={onClick}
      className="card-base flex items-center gap-3 p-2 pr-4 text-left transition-transform hover:-translate-y-0.5"
    >
      <img
        src={character.img}
        alt={character.nome}
        className="h-12 w-12 rounded-xl object-cover sm:h-14 sm:w-14"
      />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Il tuo personaggio</p>
        <p className="text-lg font-extrabold leading-tight">{character.nome}</p>
      </div>
    </button>
  )
}
