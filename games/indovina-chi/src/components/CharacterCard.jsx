export default function CharacterCard({
  character,
  eliminated = false,
  onClick,
  onViewDetail,
  selected = false,
  size = 'md',
}) {
  const isInteractive = typeof onClick === 'function'

  const sizeClasses = size === 'sm' ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? () => onClick(character.id) : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(character.id)
              }
            }
          : undefined
      }
      className={[
        'card-base group relative flex aspect-[3/4] flex-col p-1.5 transition-all duration-200 sm:p-2',
        isInteractive ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-popup' : 'cursor-default',
        eliminated ? 'scale-95 opacity-40 grayscale' : '',
        selected ? 'ring-4 ring-accent ring-offset-2' : '',
      ].join(' ')}
    >
      {onViewDetail && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onViewDetail(character.id)
          }}
          aria-label={`Guarda ${character.nome} a schermo intero`}
          className="absolute right-0.5 top-0.5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-base leading-none text-white backdrop-blur-sm transition-colors hover:bg-black/70 active:bg-black/70"
        >
          🔍
        </button>
      )}

      <div className="relative flex-1 overflow-hidden rounded-xl bg-primary-light/20">
        <img
          src={character.img}
          alt={character.nome}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <p className={`mt-1 truncate text-center font-bold ${sizeClasses}`}>{character.nome}</p>
    </div>
  )
}
