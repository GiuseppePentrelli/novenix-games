# 🥔 Parola a Tempo — Hot Potato Verbale

Gioco di riflessi da 2 a N giocatori: l'app genera una categoria e una lettera obbligatoria. Il giocatore di turno ha pochi secondi per dire (a voce o a mente) una parola valida, poi preme "Passa la patata!" per passare il turno. Il tempo si accorcia ad ogni passaggio: chi esita troppo perde una vita, ma il gioco non si ferma mai.

Il gioco è **auto-arbitrato**: l'app non valida le parole (perfetto anche per giocare in videochiamata), mostra solo categoria, lettera, timer e la patata.

## Sviluppo locale

```bash
npm install
npm run dev
```

## Build di produzione

```bash
npm run build
npm run preview
```

## Deploy gratuito su GitHub Pages

Il repo include un workflow GitHub Actions (`.github/workflows/deploy.yml`) che builda e pubblica automaticamente ad ogni push su `main`.

1. Crea un repository su GitHub e pusha questo codice sul branch `main`.
2. Nel repo su GitHub vai su **Settings → Pages** e imposta la sorgente su **GitHub Actions**.
3. Ad ogni push su `main` il sito viene ribuildato e pubblicato automaticamente su `https://<tuo-utente>.github.io/<nome-repo>/`.

## Regolamento rapido

- 2–12 giocatori, ognuno con 3 vite (❤️❤️❤️).
- Categoria e lettera restano fisse finché tutti i giocatori vivi non hanno avuto il loro turno; poi 1s di anteprima e si cambia.
- Il primo turno dura 15s; ogni passaggio successivo accorcia il tempo di 2s (minimo 4s) — non si resetta mai, il ritmo resta sempre più veloce.
- Chi non passa la patata in tempo perde una vita: appare un avviso veloce, ma il gioco **continua subito** col giocatore successivo, stessa categoria e lettera.
- La partita si ferma solo quando resta un solo giocatore in vita: è lui il vincitore.
