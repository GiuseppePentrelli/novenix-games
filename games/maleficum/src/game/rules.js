// ============================================================
// MALEFICUM — Regole economiche (facili da ritoccare)
// Bilanciate per il flusso a turni: si maledice solo nel proprio
// turno (1 lancio a turno al massimo), quindi i punti si spendono
// più lentamente rispetto al vecchio free-for-all in tempo reale.
// ============================================================

// Punti di partenza di ogni anima. Alzato rispetto al vecchio 10
// perché ora un giocatore non può più "farmare" denunce in
// continuazione per rifinanziarsi: deve reggere più turni.
export const START_POINTS = 15

// Costo FISSO per scagliare una maledizione (qualunque essa sia).
// Fisso perché la gravità è casuale finché non peschi: un costo
// variabile sarebbe imprevedibile al momento del lancio.
export const CAST_COST = 3

// Massimo di maledizioni attive contemporaneamente su una vittima.
// Tenuto basso (era 3) per non affollare lo schermo di countdown:
// l'obiettivo è guardarsi in faccia, non il telefono.
export const MAX_CURSES_PER_VICTIM = 2

// Turni del tavolo da sopravvivere per domare un vincolo, in base alla
// gravità (un "turno" = ogni volta che qualcuno risolve la propria
// azione, non solo il turno della vittima). Le maledizioni a tempo
// (kind: 'timer') usano invece il proprio campo `turns`.
export const SURVIVE_TURNS = { 1: 2, 2: 3, 3: 4 }

// Punti guadagnati domando una maledizione (sopravvivendo fino in
// fondo senza essere denunciato). Stessa scala della posta in palio
// di una denuncia riuscita: il rischio e il premio sono simmetrici.
export const surviveReward = (severity) => severity

// Punti rubati con una denuncia riuscita (approvata dall'host) = gravità.
export const denounceReward = (severity) => severity

// Penalità per chi fa una denuncia che l'host rigetta (0 = nessuna,
// solo filtro senza conseguenze). Alzare per scoraggiare accuse a caso.
export const DENOUNCE_REJECT_PENALTY = 0

// Costo per purificarsi da una maledizione prima della scadenza.
// Volutamente più alto della posta di una denuncia: deve restare
// un'opzione d'emergenza, non la via standard per liberarsi.
export const purifyCost = (severity) => severity + 1
