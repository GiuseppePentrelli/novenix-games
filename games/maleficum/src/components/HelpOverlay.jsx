import { CAST_COST, MAX_CURSES_PER_VICTIM, START_POINTS, TITHE_POINTS, TRUE_NAME_PENALTY } from '../game/rules.js'

const RULES = [
  {
    icon: '👁',
    title: "L'Officiante",
    body: "Il telefono resta in mano all'Officiante: crea il cerchio con i nomi dei giocatori, legge le carte ad alta voce, giudica ogni prova e ogni accusa e tiene i punti. Se sbaglia un tocco, può annullare l'ultima mossa.",
  },
  {
    icon: '🎲',
    title: 'Ordine dei turni',
    body: "A inizio partita ognuno tira un dado: chi fa il punteggio più alto gioca per primo, a scendere. In caso di pareggio si rilancia solo tra chi ha pareggiato. L'ordine resta fisso per tutta la partita.",
  },
  {
    icon: '🪞',
    title: 'Il tuo turno',
    body: "Quando tocca a te, esegui la carta azione davanti al cerchio rispettando le tue maledizioni attive. L'Officiante dà un voto da 0 (fallita) a 3 (memorabile): sono i punti che guadagni. Le prove a tempo hanno il cronometro.",
  },
  {
    icon: '🩸',
    title: 'Scaglia',
    body: `Puoi maledire solo nel tuo turno, prima della prova. Costa ${CAST_COST} punti. Scegli vittima e capitolo (o affidati alla sorte): il grimorio pesca una maledizione e la mostra a tutto il cerchio.`,
  },
  {
    icon: '⚡',
    title: 'Sorveglia & Denuncia',
    body: "Se becchi qualcuno che viola la sua maledizione, denuncialo ad alta voce: conta solo la prima accusa, e l'Officiante la giudica subito. Se la conferma, rubi punti pari alla gravità (☠) e chi aveva scagliato la maledizione ne guadagna altrettanti. La maledizione RESTA attiva, ma il tempo per domarla riparte da capo.",
  },
  {
    icon: '🏵️',
    title: 'Doma',
    body: "Le maledizioni durano giri interi del tavolo: un giro le lievi (☠), un giro e mezzo le medie (☠☠), due giri le nefaste (☠☠☠). Quelle a tempo durano i turni scritti sulla carta. Se resisti fino in fondo senza farti smascherare, la maledizione si dissolve e guadagni punti pari alla gravità.",
  },
  {
    icon: '🜄',
    title: 'Sacrificio',
    body: `Le carte di questo capitolo agiscono subito. Decima di Sangue: la vittima cede ${TITHE_POINTS} punti a chi l'ha maledetta. Il Vero Nome: la vittima rivela un segreto imbarazzante oppure perde ${TRUE_NAME_PENALTY} punti. Contro-Maleficio: la vittima pesca una maledizione e la scaglia gratis su chi vuole.`,
  },
  {
    icon: '🧿',
    title: 'Purifica',
    body: "Non ce la fai? Puoi chiedere all'Officiante di purificarti in qualunque momento, pagando punti (gravità +1), per togliere una maledizione prima del tempo.",
  },
  {
    icon: '⚖️',
    title: 'Limiti e fine',
    body: `Parti da ${START_POINTS} punti. Senza almeno ${CAST_COST} punti non puoi maledire. Massimo ${MAX_CURSES_PER_VICTIM} maledizioni attive su una stessa vittima. Il rito finisce dopo i giri o al traguardo di punti scelti all'inizio, oppure quando l'Officiante lo chiude.`,
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
