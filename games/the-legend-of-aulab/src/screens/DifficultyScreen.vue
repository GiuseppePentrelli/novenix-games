<template>
  <div class="diff-screen" @keydown="onKey" tabindex="0" ref="el">
    <CodeRain />
    <div class="content">
      <h2 class="title">SELEZIONA DIFFICOLTÀ</h2>

      <div class="options">
        <button
          v-for="(cfg, key) in DIFFICULTIES"
          :key="key"
          class="option"
          :class="{ selected: selected === key }"
          :style="{ '--accent': cfg.color }"
          @click="pick(key)"
        >
          <span class="diff-label">{{ cfg.label }}</span>
          <div class="diff-info">
            <span>❤️ {{ cfg.lives }} vite</span>
            <span>⚡ velocità {{ cfg.speed }}</span>
          </div>
        </button>
      </div>

      <p class="hint">Usa ↑↓ per selezionare, INVIO per confermare</p>
      <button class="back-btn" @click="store.screen = 'menu'">← INDIETRO</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CodeRain from '../components/CodeRain.vue'
import { useGameStore, DIFFICULTIES } from '../store/game'

const store = useGameStore()
const el = ref(null)
const keys = Object.keys(DIFFICULTIES)
const selected = ref(store.difficulty)

function pick(key) {
  store.difficulty = key
  store.screen = 'game'
}

function onKey(e) {
  const i = keys.indexOf(selected.value)
  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    selected.value = keys[(i - 1 + keys.length) % keys.length]
    e.preventDefault()
  } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    selected.value = keys[(i + 1) % keys.length]
    e.preventDefault()
  } else if (e.key === 'Enter') {
    if (e.target.tagName === 'BUTTON') return
    e.preventDefault()
    pick(selected.value)
  } else if (e.key === 'Escape') {
    store.screen = 'menu'
  }
}

onMounted(() => el.value?.focus())
</script>

<style scoped>
.diff-screen {
  position: absolute;
  inset: 0;
  background: #0a0f28;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  z-index: 10;
  outline: none;
}
.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}
.title {
  color: #ffd700;
  font-size: clamp(1.2rem, 4vw, 2rem);
  letter-spacing: 2px;
}
.options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: clamp(260px, 50vw, 420px);
}
.option {
  background: #0d1535;
  border: 3px solid #2a3560;
  border-radius: 10px;
  padding: 1rem 1.5rem;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, transform 0.1s;
  font-family: monospace;
}
.option.selected {
  border-color: var(--accent);
  transform: scale(1.03);
  background: #141c40;
  box-shadow: 0 0 16px var(--accent)44;
}
.diff-label {
  display: block;
  color: var(--accent);
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 0.4rem;
}
.diff-info {
  display: flex;
  gap: 1.5rem;
  color: #888;
  font-size: 0.85rem;
}
.hint { color: #555; font-size: 0.8rem; }
.back-btn {
  background: none;
  border: none;
  color: #6688aa;
  font-family: monospace;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
}
.back-btn:hover { color: #aabbdd; }
</style>
