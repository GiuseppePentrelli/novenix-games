<template>
  <div class="hud" :class="{ paused: isPaused }">
    <div class="topbar">
      <div class="coins">🪙 {{ store.coins }}</div>
      <div class="deaths">Tentativi: {{ store.deaths }}</div>
      <div class="hearts">
        <span v-for="i in store.lives" :key="i">❤️</span>
        <span v-for="i in (store.diffConfig.lives - store.lives)" :key="'e'+i" class="empty-heart">🖤</span>
      </div>
      <button class="pause-btn" :aria-label="isPaused ? 'Riprendi' : 'Pausa'" @click="togglePause">
        {{ isPaused ? '▶' : '⏸' }}
      </button>
    </div>
    <transition name="fade">
      <div v-if="isPaused" class="pause-overlay">
        <div class="pause-box">
          <p class="pause-title">PAUSA</p>
          <button class="pmenu-btn" @click="togglePause">▶ RIPRENDI</button>
          <button class="pmenu-btn danger" @click="quitToMenu">🏠 MENU</button>
        </div>
      </div>
    </transition>
    <button
      class="jump-btn"
      @pointerdown.prevent.stop="emitJump"
      aria-label="Salta"
    >⬆</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../store/game'

const store = useGameStore()
const isPaused = ref(false)
function onKey(event) {
  if (event.key === 'Escape') togglePause()
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

function togglePause() {
  isPaused.value = !isPaused.value
  window.dispatchEvent(new CustomEvent('hud:pause', { detail: isPaused.value }))
}

function quitToMenu() {
  isPaused.value = false
  window.dispatchEvent(new CustomEvent('hud:pause', { detail: false }))
  window.dispatchEvent(new CustomEvent('hud:quit'))
}

function emitJump() {
  if (isPaused.value) return
  window.dispatchEvent(new CustomEvent('hud:jump'))
}
</script>

<style scoped>
.hud {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  font-family: monospace;
}
.topbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1rem;
  height: 56px;
  background: rgba(0, 0, 0, 0.55);
  pointer-events: all;
}
.coins  { color: #ffd700; font-size: 1.1rem; min-width: 60px; }
.deaths { color: #aaa; font-size: 0.9rem; flex: 1; text-align: center; }
.hearts { display: flex; gap: 2px; font-size: 1.1rem; }
.empty-heart { opacity: 0.25; }
.pause-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.4rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  pointer-events: all;
}

.pause-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
}
.pause-box {
  background: #0d1535;
  border: 3px solid #ffd700;
  border-radius: 12px;
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.pause-title {
  color: #ffd700;
  font-size: 2rem;
  letter-spacing: 4px;
}
.pmenu-btn {
  background: #1a2a5a;
  border: 2px solid #3355aa;
  border-radius: 8px;
  color: #fff;
  font-family: monospace;
  font-size: 1rem;
  padding: 0.6rem 2rem;
  cursor: pointer;
  width: 100%;
  transition: background 0.15s;
}
.pmenu-btn:hover { background: #2a3a7a; }
.pmenu-btn.danger { border-color: #aa3333; }
.pmenu-btn.danger:hover { background: #4a1515; }

.jump-btn {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(255, 215, 0, 0.25);
  border: 3px solid #ffd700;
  color: #ffd700;
  font-size: 1.6rem;
  cursor: pointer;
  pointer-events: all;
  touch-action: manipulation;
  user-select: none;
}
@media (hover: hover) {
  /* Desktop: nasconde il pulsante touch */
  .jump-btn { display: none; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
