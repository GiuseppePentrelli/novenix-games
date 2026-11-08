// ============================================================
// MALEFICUM — Regole economiche (facili da ritoccare)
// Si maledice solo nel proprio turno e l'Officiante giudica tutto
// da un solo telefono.
// ============================================================

// Punti di partenza di ogni anima.
export const START_POINTS = 15

// Costo FISSO per scagliare una maledizione (qualunque essa sia):
// la gravità è casuale finché non peschi.
export const CAST_COST = 3

// Massimo di maledizioni attive contemporaneamente su una vittima.
export const MAX_CURSES_PER_VICTIM = 2

// Giri completi del tavolo da sopravvivere per domare un vincolo, in
// base alla gravità. Un giro = tante azioni quante sono le anime, così
// la durata resta giusta sia in 3 sia in 10. Le maledizioni a tempo
// (kind: 'timer') contano invece i turni del tavolo scritti sulla carta.
export const SURVIVE_ROUNDS = { 1: 1, 2: 1.5, 3: 2 }

// Punti guadagnati domando una maledizione senza farsi smascherare.
export const surviveReward = (severity) => severity

// Denuncia confermata: chi smaschera ruba punti pari alla gravità e
// chi aveva scagliato la maledizione ne guadagna altrettanti.
export const denounceReward = (severity) => severity
export const casterReward = (severity) => severity

// Penalità per chi fa una denuncia che l'Officiante respinge.
export const DENOUNCE_REJECT_PENALTY = 0

// Costo per purificarsi da una maledizione prima della scadenza.
export const purifyCost = (severity) => severity + 1

// Voto dell'Officiante a ogni prova: 0 = fallita, 3 = memorabile.
export const VOTE_MAX = 3

// Il Vero Nome: chi non rivela il segreto perde questi punti.
export const TRUE_NAME_PENALTY = 3

// Decima di Sangue: punti che la vittima cede a chi l'ha maledetta.
export const TITHE_POINTS = 2

// Traguardi tra cui scegliere a inizio rito.
export const GOALS = {
  rounds: [2, 3, 4, 5],
  points: [25, 35, 50],
}
export const DEFAULT_GOAL = { type: 'rounds', value: 3 }
