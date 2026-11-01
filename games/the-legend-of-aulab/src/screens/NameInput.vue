<template>
  <div class="name-screen">
    <CodeRain />
    <div class="content">
      <h2 class="label">INSERISCI IL TUO NOME</h2>
      <div class="input-display">{{ display }}</div>

      <div class="keyboard">
        <div v-for="(row, ri) in layout" :key="ri" class="row">
          <button
            v-for="ch in row"
            :key="ch"
            class="key"
            @click="add(ch)"
          >{{ ch }}</button>
        </div>
        <div class="row special-row">
          <button class="key del" @click="del">DEL</button>
          <button class="key ok" @click="confirm">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CodeRain from '../components/CodeRain.vue'
import { useGameStore } from '../store/game'

const store = useGameStore()
const name = ref('')

const display = computed(() => name.value || '_')
const layout = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM']

function add(ch) {
  if (name.value.length < 10) name.value += ch
}
function del() {
  name.value = name.value.slice(0, -1)
}
function confirm() {
  if (!name.value) return
  store.playerName = name.value
  store.screen = 'menu'
}

function onKey(e) {
  if (e.key === 'Tab' || e.ctrlKey || e.metaKey || e.altKey) return
  if (e.target.tagName === 'BUTTON' && ['Enter', ' '].includes(e.key)) return
  if (/^[a-zA-Z]$/.test(e.key)) add(e.key.toUpperCase())
  else if (e.key === 'Backspace') del()
  else if (e.key === 'Enter') confirm()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.name-screen {
  position: absolute;
  inset: 0;
  background: #0a0f28;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  font-family: monospace;
}
.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  padding: 0 1rem;
}
.label {
  color: #ffd700;
  font-size: clamp(1.1rem, 4vw, 2rem);
  letter-spacing: 2px;
}
.input-display {
  color: #00ffb4;
  font-size: clamp(2rem, 8vw, 3.5rem);
  min-width: 200px;
  text-align: center;
  letter-spacing: 4px;
  text-shadow: 0 0 12px #00ffb466;
}
.keyboard { display: flex; flex-direction: column; gap: 6px; align-items: center; }
.row { display: flex; gap: 6px; }
.key {
  width: clamp(28px, 5vw, 44px);
  height: clamp(28px, 5vw, 44px);
  background: #28325a;
  color: #fff;
  border: 2px solid #3c4a7a;
  border-radius: 6px;
  font-family: monospace;
  font-size: clamp(0.7rem, 2vw, 1rem);
  cursor: pointer;
  transition: background 0.1s;
}
.key:hover, .key:active { background: #4a5fa0; }
.special-row { margin-top: 4px; }
.del {
  width: clamp(56px, 10vw, 90px);
  background: #8c2020;
  border-color: #c44;
}
.del:hover { background: #b42222; }
.ok {
  width: clamp(56px, 10vw, 90px);
  background: #1e7d2e;
  border-color: #2a8;
}
.ok:hover { background: #27a83e; }
</style>
