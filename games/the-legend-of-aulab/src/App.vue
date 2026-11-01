<template>
  <a class="back-to-arcade" href="../../">← SALA GIOCHI</a>
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
</template>

<script setup>
import { watch, onMounted } from 'vue'
import { useGameStore } from './store/game'
import { initKaplay, startGame, stopGame } from './game/kaplay.js'

import HUD            from './game/HUD.vue'
import StartScreen    from './screens/StartScreen.vue'
import NameInput      from './screens/NameInput.vue'
import MainMenu       from './screens/MainMenu.vue'
import DifficultyScreen from './screens/DifficultyScreen.vue'
import EndScreen      from './screens/EndScreen.vue'

const store = useGameStore()

watch(() => store.screen, (val) => {
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

onMounted(() => {
  window.nomeGiocatore = store.playerName

  window.addEventListener('game:hud-update', (e) => {
    store.lives  = e.detail.lives
    store.coins  = e.detail.coins
    store.deaths = e.detail.deaths
  })

  window.addEventListener('game:win', (e) => {
    store.finalCoins = e.detail.coins
    store.deaths     = e.detail.deaths ?? store.deaths
    store.screen     = 'end'
  })

  window.addEventListener('game:quit', () => {
    store.screen = 'menu'
  })
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

.screen-enter-active,
.screen-leave-active {
  transition: opacity 0.35s ease;
}
.screen-enter-from,
.screen-leave-to {
  opacity: 0;
}
</style>
