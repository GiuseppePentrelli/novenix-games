// ============================================================
// MALEFICUM — Mazzo delle Maledizioni
// Dati in ./data/curses.json. Ogni maledizione ha:
//  - id: identificatore stabile
//  - category: Favelle | Posture | Rituali | Sacrificio
//  - title: nome evocativo
//  - text: cosa impone alla vittima
//  - severity: 1 (lieve) → 3 (nefasta) — usata per i punti in palio
//  - kind: 'constraint' (vincolo attivo finché non violato/scade)
//          'timer' (dura N turni del tavolo)
//          'instant' (effetto immediato, solo Sacrificio)
//  - turns: numero di turni, solo per kind === 'timer'
//  - img: null oggi, riservato a una futura illustrazione stile tarocchi
// ============================================================

import CURSES_DATA from './data/curses.json' with { type: 'json' }

export const CATEGORIES = {
  Favelle: {
    color: 'hex',
    icon: '🜍',
    blurb: 'Maledizioni della parola e del silenzio',
  },
  Posture: {
    color: 'venom',
    icon: '🜃',
    blurb: 'Vincoli del corpo e della postura',
  },
  Rituali: {
    color: 'ember',
    icon: '🜂',
    blurb: 'Gesti e rituali imposti',
  },
  Sacrificio: {
    color: 'blood',
    icon: '🜄',
    blurb: 'Le più nefaste: punti e pegni',
  },
}

export const DECK = CURSES_DATA
