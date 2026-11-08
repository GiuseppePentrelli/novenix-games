# Crediti e stato delle licenze

## Sala giochi

Cabinati, anteprima a pixel, icone pixel dei riquadri della home (`src/tiles.js`), icona e decorazioni sono disegnati nel codice del progetto. Non utilizzano grafiche di giochi o marchi esistenti. Il codice del progetto non riceve automaticamente una licenza di redistribuzione da questa nota.

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

## Giochi party

Maleficum, Indovina Chi?, Parola a Tempo (`hot-potato`), Top 10 e UnderCover provengono dai repository di Giuseppe salvati in `~/backup/2026-10-22/github/` (ultimo commit di ciascuno). Nella sala sono cambiati solo percorso base, versione di Vite e del plugin React, configurazione di Tailwind per la build dalla radice, font ospitati localmente e il pulsante «← SALA GIOCHI».

| Gioco | Asset | Stato |
| --- | --- | --- |
| Indovina Chi? | 24 ritratti in `games/indovina-chi/public/characters/` | Ritratti illustrati, non foto. In un ritratto controllato compare in basso a destra il simbolo ✦ delle immagini generate con Gemini: fonte e condizioni d'uso da confermare. |
| Maleficum | Cinzel Decorative, Creepster, EB Garamond | SIL Open Font License 1.1; licenze in `licenses/CinzelDecorative-OFL.txt`, `licenses/Creepster-OFL.txt`, `licenses/EBGaramond-OFL.txt`. Solo sottoinsieme latino, ospitato in `games/maleficum/src/assets/fonts/`. |
| Indovina Chi? | Baloo 2 | SIL Open Font License 1.1; licenza in `licenses/Baloo2-OFL.txt`. Sottoinsieme latino in `games/indovina-chi/src/assets/fonts/`. |
| UnderCover | Big Shoulders Stencil, Courier Prime | SIL Open Font License 1.1; licenze in `licenses/BigShouldersStencil-OFL.txt` e `licenses/CourierPrime-OFL.txt`. File già presenti nel repository originale. |
| Maleficum, Top 10 | `favicon.svg`, `icons.svg` | File del modello Vite + React. |

Nessun gioco richiede più font a Google Fonts durante la visita. «Indovina Chi?» è anche il titolo italiano del gioco da tavolo Hasbro «Guess Who?»: non è stata verificata alcuna autorizzazione sul nome.

I giochi online (Maleficum, Indovina Chi?, UnderCover) collegano i giocatori con PeerJS, che per l'aggancio iniziale usa il server pubblico gratuito di PeerJS; Maleficum indica anche i server STUN pubblici di Google e il relay TURN pubblico Open Relay di Metered.

Dipendenze dei giochi party, con le licenze complete in `licenses/`:

- react 19.3.1 e 18.3.1, react-dom 19.3.1 e 18.3.1, scheduler 0.28.0 e 0.23.2: MIT (https://react.dev/); testi in `react-LICENSE.txt` e `react-18-LICENSE.txt`.
- peerjs 1.5.5: MIT (https://peerjs.com); con peerjs-js-binarypack 2.1.0 (MIT), webrtc-adapter 9.0.6 (BSD-3-Clause), sdp 3.2.3 (MIT), eventemitter3 4.0.7 (MIT), @msgpack/msgpack 2.8.0 (ISC).
- framer-motion 12.43.0, motion-dom 12.43.0, motion-utils 12.39.0: MIT (https://motion.dev); tslib 2.9.1: 0BSD.
- tailwindcss 4.3.5 e 3.4.19, @tailwindcss/vite 4.3.5: MIT (https://tailwindcss.com).
- @vitejs/plugin-react 6.2.1: MIT (https://github.com/vitejs/vite-plugin-react).
- postcss 8.5.32 e autoprefixer 10.6.2: MIT (https://postcss.org/).
