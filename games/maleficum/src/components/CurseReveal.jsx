import { CATEGORIES } from '../game/deck.js'
import { MAX_CURSES_PER_VICTIM, TRUE_NAME_PENALTY } from '../game/rules.js'

const glow = { hex: 'text-hex-glow', venom: 'text-venom-glow', ember: 'text-[color:var(--color-ember)]', blood: 'text-[color:var(--color-blood)]' }

// La carta appena pescata, in grande, da mostrare a tutto il cerchio.
// Le carte Sacrificio che chiedono una scelta si chiudono solo scegliendo.
export default function CurseReveal({ reveal, state, onResolve, onDismiss }) {
  const { curse, casterId, victimId, instanceId, resolved, counter } = reveal
  const caster = state.players[casterId]
  const victim = state.players[victimId]
  const cat = CATEGORIES[curse.category] ?? {}
  const inst = state.activeCurses.find((c) => c.instanceId === instanceId)
  const targets = state.turnOrder
    .map((id) => state.players[id])
    .filter((p) => p.id !== victimId && state.activeCurses.filter((c) => c.victimId === p.id).length < MAX_CURSES_PER_VICTIM)

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center gap-4 max-h-[94svh] overflow-y-auto">
        <p className="text-xs uppercase tracking-widest text-[color:var(--color-ember)] text-center">
          {counter ? 'Il maleficio si rovescia!' : 'Il grimorio ha pescato'}
        </p>
        <p className="font-body text-lg text-center text-[color:var(--color-parchment)]">
          {caster?.avatar} {caster?.name} <span className="text-[color:var(--color-parchment-dim)]">→</span> {victim?.avatar} {victim?.name}
        </p>

        <div className="grimoire-panel hex-strike w-full max-w-[300px] min-h-[340px] p-6 flex flex-col text-center border-2 border-[color:var(--color-hex)]">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)]">
            <span>{cat.icon}</span>
            <span>{curse.category}</span>
            <span>{'☠'.repeat(curse.severity)}</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
            <h2 className={`font-grimoire text-3xl leading-tight ${glow[cat.color] ?? 'text-hex-glow'}`}>{curse.title}</h2>
            <p className="font-body text-xl italic leading-snug text-[color:var(--color-parchment)]">{curse.text}</p>
          </div>
          <p className="text-xs uppercase tracking-widest text-[color:var(--color-parchment-dim)]">
            {inst
              ? `domata tra ${inst.turnsNeeded} turni del tavolo`
              : curse.kind === 'instant'
                ? 'effetto immediato'
                : 'nessun effetto'}
          </p>
        </div>

        {resolved ? (
          <button className="sigil-btn blood text-lg w-full max-w-[300px]" onClick={onDismiss}>
            Il cerchio ha visto ✓
          </button>
        ) : curse.id === 'sac-name' ? (
          <div className="flex flex-col gap-2 w-full max-w-[300px]">
            <p className="text-center font-body text-[color:var(--color-parchment-dim)]">Cosa sceglie {victim?.name}?</p>
            <button className="sigil-btn venom text-base" onClick={() => onResolve({ choice: 'secret' })}>
              🤫 Rivela il segreto
            </button>
            <button className="sigil-btn blood text-base" onClick={() => onResolve({ choice: 'pay' })}>
              💸 Tace e perde {TRUE_NAME_PENALTY} punti
            </button>
          </div>
        ) : curse.id === 'sac-curse-back' ? (
          <div className="flex flex-col gap-2 w-full max-w-[300px]">
            <p className="text-center font-body text-[color:var(--color-parchment-dim)]">
              {victim?.name} pesca una maledizione e la scaglia gratis. Su chi?
            </p>
            {targets.length ? (
              <div className="flex flex-wrap justify-center gap-2">
                {targets.map((p) => (
                  <button key={p.id} className="sigil-btn !px-3 !py-2 text-sm" onClick={() => onResolve({ targetId: p.id })}>
                    {p.avatar} {p.name}
                  </button>
                ))}
              </div>
            ) : (
              <button className="sigil-btn" onClick={() => onResolve({})}>
                Nessuna anima può riceverla
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
