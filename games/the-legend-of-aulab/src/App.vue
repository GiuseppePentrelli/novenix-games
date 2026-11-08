<template>
  <a v-if="store.screen !== 'game'" class="back-to-arcade" href="../../arcade/">← ARCADE</a>
  <HUD v-if="store.screen === 'game'" />
  <Transition name="screen">
    <StartScreen      v-if="store.screen === 'start'" />
    <NameInput        v-else-if="store.screen === 'name'" />
    <MainMenu         v-else-if="store.screen === 'menu'" />
    <DifficultyScreen v-else-if="store.screen === 'difficulty'" />
  </Transition>
  <Transition name="screen">
    <EndScreen v-if="store.screen === 'end'" />
  </Transition>
  <div class="rotate-hint" role="status">
    <div class="rotate-phone" aria-hidden="true"></div>
    <p class="rotate-title">RUOTA IL TELEFONO</p>
    <p class="rotate-sub">{{ canGoFullscreen ? 'Tocca lo schermo per giocare in orizzontale a schermo intero' : 'The Legend of Aulab si gioca in orizzontale' }}</p>
  </div>
</template>

<script setup>
import { watch, onMounted, onUnmounted } from 'vue'
import { useGameStore } from './store/game'
import { initKaplay, startGame, stopGame } from './game/kaplay.js'
import { playMenuMusic } from './menu-music.js'
import { canGoFullscreen } from './immersive.js'

import HUD            from './game/HUD.vue'
import StartScreen    from './screens/StartScreen.vue'
import NameInput      from './screens/NameInput.vue'
import MainMenu       from './screens/MainMenu.vue'
import DifficultyScreen from './screens/DifficultyScreen.vue'
import EndScreen      from './screens/EndScreen.vue'

const store = useGameStore()

watch(() => store.screen, (val) => {
  if (['name', 'menu', 'difficulty'].includes(val)) playMenuMusic()
  if (val === 'game') {
    initKaplay()
    store.resetRun()
    startGame({ speed: store.diffConfig.speed, lives: store.diffConfig.lives })
  }
  if (val === 'end') stopGame()
  if (val === 'menu') {

    window.nomeGiocatore = store.playerName
  }
})

watch(() => store.playerName, (name) => {
  window.nomeGiocatore = name
})

const events = {
  'game:hud-update': ({ detail }) => {
    store.lives = detail.lives
    store.coins = detail.coins
    store.deaths = detail.deaths
  },
  'game:win': ({ detail }) => {
    store.finalCoins = detail.coins
    store.deaths = detail.deaths ?? store.deaths
    store.screen = 'end'
  },
  'game:quit': () => { store.screen = 'menu' },
}
onMounted(() => {
  window.nomeGiocatore = store.playerName
  for (const [name, handler] of Object.entries(events)) window.addEventListener(name, handler)
})
onUnmounted(() => {
  for (const [name, handler] of Object.entries(events)) window.removeEventListener(name, handler)
  stopGame()
})

</script>

<style>
/* Global canvas style — KapayJS creates its canvas and appends to body */
canvas {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 0;
}

.rotate-hint {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 500;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 24px;
  background: #0a0f28;
  color: #ffd700;
  font-family: monospace;
  text-align: center;
}
@media (orientation: portrait) and (pointer: coarse) {
  .rotate-hint { display: flex; }
}
.rotate-phone {
  width: 54px;
  height: 92px;
  border: 4px solid #ffd700;
  border-radius: 10px;
  animation: rotate-phone 2.4s ease-in-out infinite;
}
.rotate-title { font-size: 20px; letter-spacing: 3px; }
.rotate-sub { max-width: 260px; color: #b8c6e2; font-size: 14px; line-height: 1.6; }
@keyframes rotate-phone {
  0%, 30% { transform: rotate(0deg); }
  60%, 100% { transform: rotate(-90deg); }
}

.screen-enter-active,
.screen-leave-active {
  transition: opacity 0.35s ease;
}
.screen-enter-from,
.screen-leave-to {
  opacity: 0;
}
</style>
