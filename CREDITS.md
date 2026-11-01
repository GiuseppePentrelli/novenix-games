# Crediti e stato delle licenze

## Sala giochi

Cabinati, anteprima a pixel, icona e decorazioni sono disegnati nel codice del progetto. Non utilizzano grafiche di giochi o marchi esistenti. Il codice del progetto non riceve automaticamente una licenza di redistribuzione da questa nota.

Il font previsto è **Press Start 2P**, Copyright 2012 The Press Start 2P Project Authors, SIL Open Font License 1.1, Reserved Font Name "Press Start 2P". La licenza è in `licenses/PressStart2P-OFL.txt`; fonte ufficiale: https://github.com/google/fonts/tree/main/ofl/pressstart2p. Il file `public/fonts/PressStart2P-Regular.ttf` deve ancora essere scaricato: la rete dell'ambiente di lavoro non è disponibile. La versione attuale usa il fallback monospace finché il font manca.

## The Legend of Aulab

Il gioco proviene dalla copia locale di Giuseppe `~/dev/da-controllare/TheLegendOfAulab`. L'HTML storico non è stato copiato. Gli asset incorporati nel vecchio `src/game/assets.js` sono stati estratti senza ridisegni o conversioni e quelli non utilizzati sono stati esclusi.

**Giuseppe ricorda che gli asset erano a licenza libera** (confermato il 2026-11-01). I riferimenti originali e le condizioni precise non sono ancora stati ricostruiti: restano da verificare eventuali attribuzioni richieste. Non è stata assegnata loro una licenza generica né sono considerati di pubblico dominio.

| Asset mantenuti | Stato |
| --- | --- |
| `pog`, `karat`, `beantle`, `gigagantrum`, `ghosty`, `apple`, `coin`, `grass`, `minus`, `sun`, `marks_legend`, `sparkling` | Autori, fonte originale e licenza da identificare. Alcuni nomi richiamano le risorse dimostrative di Kaboom/KAPLAY, ma non è stato verificato il confronto dei file. |
| `valerio`, `francesco`, `nicola`, `matteo` | Giuseppe ricorda una licenza libera; fonte e condizioni esatte da ricostruire. |
| `bg_salon`, `streetNight` | Giuseppe ricorda una licenza libera; fonte e condizioni esatte da ricostruire. Non è possibile dedurle dall'aspetto. |
| `MusicaMenuPrincipale`, `caduta`, `coinSound`, `eatApple`, `ouch`, `win`, `GameOver` | Giuseppe ricorda una licenza libera; fonte, compositore e condizioni esatte da ricostruire; nessun riconoscimento audio completato. |

I file elencati sono in `games/the-legend-of-aulab/public/sprites/` e `sounds/`. Il controllo visivo di `pog`, `karat`, `marks_legend`, `bg_salon` e `streetNight` non ha identificato asset Nintendo/Zelda, ma non certifica l'originalità degli altri file. Il titolo e i dialoghi citano Aulab; la schermata finale riproduce un attestato fittizio con il nome Aulab scritto in testo. Non è stata verificata alcuna autorizzazione del marchio. Non c'è un logo Aulab separato fra gli asset mantenuti.

Vue, Pinia, Vite e KAPLAY restano soggetti alle rispettive licenze distribuite con i pacchetti. Il download delle dipendenze è ancora da completare; l'inventario delle licenze effettivamente installate e degli eventuali asset interni di KAPLAY va verificato dopo l'installazione.
