# Crediti e stato delle licenze

## Sala giochi

Cabinati, anteprima a pixel, icona e decorazioni sono disegnati nel codice del progetto. Non utilizzano grafiche di giochi o marchi esistenti. Il codice del progetto non riceve automaticamente una licenza di redistribuzione da questa nota.

Il font è **Press Start 2P**, Copyright 2012 The Press Start 2P Project Authors, SIL Open Font License 1.1, Reserved Font Name "Press Start 2P". La licenza è in `licenses/PressStart2P-OFL.txt`; fonte ufficiale: https://github.com/google/fonts/tree/main/ofl/pressstart2p. Il font è ospitato localmente in `public/fonts/PressStart2P-Regular.ttf`: non viene richiesto a Google Fonts durante la visita.

## The Legend of Aulab

Il gioco proviene dalla copia locale di Giuseppe `~/dev/da-controllare/TheLegendOfAulab`. L'HTML storico non è stato copiato. Gli asset incorporati nel vecchio `src/game/assets.js` sono stati estratti senza ridisegni o conversioni e quelli non utilizzati sono stati esclusi.

**Giuseppe ricorda che gli asset erano a licenza libera** (confermato il 2026-11-01). I riferimenti originali e le condizioni precise non sono ancora stati ricostruiti: restano da verificare eventuali attribuzioni richieste. Non è stata assegnata loro una licenza generica né sono considerati di pubblico dominio.

| Asset mantenuti | Stato |
| --- | --- |
| `pog`, `karat`, `beantle`, `gigagantrum`, `ghosty`, `apple`, `coin`, `grass`, `minus`, `sun`, `marks_legend`, `sparkling` | Autori, fonte originale e licenza da identificare. Alcuni nomi richiamano le risorse dimostrative di Kaboom/KAPLAY, ma non è stato verificato il confronto dei file. |
| `valerio`, `francesco`, `nicola`, `matteo` | Giuseppe ricorda una licenza libera; fonte e condizioni esatte da ricostruire. |
| `bg_salon`, `streetNight` | Giuseppe ricorda una licenza libera; fonte e condizioni esatte da ricostruire. Non è possibile dedurle dall'aspetto. |
| `MusicaMenuPrincipale`, `Intro`, `caduta`, `coinSound`, `eatApple`, `ouch`, `win`, `GameOver` | Giuseppe ricorda una licenza libera; fonte, compositore e condizioni esatte da ricostruire; nessun riconoscimento audio completato. |

I file elencati sono in `games/the-legend-of-aulab/public/sprites/` e `sounds/`. Il controllo visivo di `pog`, `karat`, `marks_legend`, `bg_salon` e `streetNight` non ha identificato asset Nintendo/Zelda, ma non certifica l'originalità degli altri file. Il titolo e i dialoghi citano Aulab; la schermata finale riproduce un attestato fittizio con il nome Aulab scritto in testo. Non è stata verificata alcuna autorizzazione del marchio. Non c'è un logo Aulab separato fra gli asset mantenuti.

Le dipendenze installate sono elencate qui sotto. Le relative licenze complete sono conservate in `licenses/`; KAPLAY include anche risorse interne, le cui attribuzioni vanno mantenute come distribuite nel pacchetto.


- vue 3.5.44: MIT (https://vuejs.org/).
- pinia 3.0.4: MIT (https://pinia.vuejs.org).
- vite 8.3.5: MIT (https://vite.dev).
- @vitejs/plugin-vue 6.0.10: MIT (https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#readme).
- kaplay 3001.0.19: il manifest dichiara MIT, ma il file LICENSE.md distribuito aggiunge restrizioni sull’uso per addestrare sistemi di apprendimento automatico; testo completo in `licenses/kaplay-LICENSE.txt` (https://kaplayjs.com/).
