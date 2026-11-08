import { CAST_COST, MAX_CURSES_PER_VICTIM, START_POINTS } from '../game/rules.js'

const RULES = [
  {
    icon: '🎲',
    title: 'Ordine dei turni',
    body: 'A inizio partita ognuno tira un dado: chi fa il punteggio più alto gioca per primo, a scendere. In caso di pareggio si rilancia solo tra chi ha pareggiato. L\'ordine resta fisso per tutta la partita.',
  },
  {
    icon: '🪞',
    title: 'Il tuo turno',
    body: 'Quando tocca a te, peschi una carta azione e la esegui davanti al cerchio, rispettando anche i vincoli delle tue maledizioni attive. Non tocca a te dire se è andata bene: è sempre l\'Officiante (l\'host) a giudicare, così nessuno deve validare nulla dal telefono. Se riuscita, guadagni i punti indicati sulla carta.',
  },
  {
    icon: '🩸',
    title: 'Scaglia',
    body: `Puoi maledire solo nel tuo turno. Costa ${CAST_COST} punti. Scegli vittima e capitolo (o affidati alla sorte): peschi una maledizione a caso e gliela imponi.`,
  },
  {
    icon: '👁',
    title: 'Sorveglia & Denuncia',
    body: 'Se becchi qualcuno che viola la sua maledizione, denuncialo: solo la prima accusa conta, e resta sospesa finché l\'Officiante (l\'host) non la giudica. Se la conferma, rubi punti pari alla gravità (☠) e la maledizione RESTA attiva, ma il tempo per domarla riparte da capo.',
  },
  {
    icon: '🏵️',
    title: 'Doma',
    body: 'Se resisti fino allo scadere del tempo senza essere denunciato con successo, hai domato il maleficio: si dissolve e guadagni punti pari alla sua gravità.',
  },
  {
    icon: '🧿',
    title: 'Purifica',
    body: 'Non ce la fai? Puoi purificarti in qualunque momento pagando punti (gravità +1) per togliere una maledizione prima del tempo.',
  },
  {
    icon: '⚖️',
    title: 'Limiti',
    body: `Parti da ${START_POINTS} punti. Finiti i punti, non puoi più maledire nel tuo turno (recuperi denunciando o completando azioni). Max ${MAX_CURSES_PER_VICTIM} maledizioni attive su una stessa vittima.`,
  },
]

export default function HelpOverlay({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="grimoire-panel w-full max-w-lg p-6 flex flex-col gap-4 max-h-[90svh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-grimoire text-2xl text-hex-glow text-center">Come si gioca</h2>
        <ul className="flex flex-col gap-3">
          {RULES.map((r) => (
            <li key={r.title} className="flex gap-3">
              <span className="text-2xl shrink-0">{r.icon}</span>
              <div>
                <h3 className="font-grimoire text-[color:var(--color-parchment)]">{r.title}</h3>
                <p className="font-body text-[15px] text-[color:var(--color-parchment-dim)] leading-snug">
                  {r.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <button className="sigil-btn mt-1" onClick={onClose}>
          Ho capito
        </button>
      </div>
    </div>
  )
}
