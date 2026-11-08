// ============================================================
// MALEFICUM — Mazzo delle Azioni (bozza)
// Carte pescate ad ogni turno: la sfida che il giocatore deve
// eseguire rispettando, se attiva, la sua maledizione.
//  - id: identificatore stabile
//  - category: Mimica | Vocale | Racconto | Sociale
//  - title: nome evocativo
//  - text: cosa deve fare il giocatore
//  - difficulty: 1 (facile) → 3 (ardua)
//  - reward: punti guadagnati se l'azione è completata con successo
//  - img: null oggi, riservato a una futura illustrazione stile tarocchi
// ============================================================

import ACTIONS_DATA from './data/actions.json' with { type: 'json' }

export const ACTION_CATEGORIES = {
  Mimica: { color: 'venom', icon: '🜃', blurb: 'Il corpo racconta ciò che la voce non può' },
  Vocale: { color: 'hex', icon: '🜍', blurb: 'Suoni, accenti, sussurri e grida' },
  Racconto: { color: 'ember', icon: '🜂', blurb: 'Storie improvvisate davanti al cerchio' },
  Sociale: { color: 'blood', icon: '🜄', blurb: 'Sfide che coinvolgono le altre anime' },
}

export const ACTIONS = ACTIONS_DATA
