import { denounceReward } from '../game/rules.js'

// Bottone di denuncia + stato di giudizio per una singola maledizione attiva.
export default function DenounceControl({ curse, isHost, myId, onDispatch }) {
  if (curse.pendingDenounce) {
    if (isHost) {
      return (
        <div className="flex flex-col gap-2 w-full">
          <p className="text-xs text-center uppercase tracking-widest text-[color:var(--color-ember)]">
            ⚖ Tocca a te giudicare
          </p>
          <div className="flex gap-2">
            <button
              className="sigil-btn blood flex-1 !py-2.5 text-base"
              onClick={() =>
                onDispatch({
                  type: 'DENOUNCE_RESOLVE',
                  instanceId: curse.instanceId,
                  by: myId,
                  approve: true,
                })
              }
            >
              ✅ Confermo
            </button>
            <button
              className="sigil-btn flex-1 !py-2.5 text-base"
              onClick={() =>
                onDispatch({
                  type: 'DENOUNCE_RESOLVE',
                  instanceId: curse.instanceId,
                  by: myId,
                  approve: false,
                })
              }
            >
              ❌ Respingo
            </button>
          </div>
        </div>
      )
    }
    return (
      <span className="text-sm text-[color:var(--color-ember)] font-body italic">
        ⚖ Sotto giudizio dell'Officiante…
      </span>
    )
  }

  return (
    <button
      className="sigil-btn blood w-full !py-3 text-lg flicker"
      onClick={() =>
        onDispatch({ type: 'DENOUNCE_REQUEST', instanceId: curse.instanceId, accuserId: myId })
      }
    >
      ⚡ DENUNCIA — ruba {denounceReward(curse.curse.severity)} punti
    </button>
  )
}
