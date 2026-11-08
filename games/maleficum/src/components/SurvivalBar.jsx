// Barra + testo dei turni residui per domare la maledizione.
export default function SurvivalBar({ curse }) {
  const left = Math.max(0, curse.turnsNeeded - curse.turnsSurvived)
  const frac = curse.turnsNeeded > 0 ? curse.turnsSurvived / curse.turnsNeeded : 0
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)] mb-1">
        <span>domi tra</span>
        <span className="text-[color:var(--color-ember)] font-bold">
          {left} {left === 1 ? 'turno' : 'turni'}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[color:var(--color-abyss)] overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${frac * 100}%`,
            background: 'linear-gradient(90deg, var(--color-ember), var(--color-hex))',
          }}
        />
      </div>
    </div>
  )
}
