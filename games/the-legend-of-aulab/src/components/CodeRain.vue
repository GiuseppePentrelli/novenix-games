<template>
  <div class="code-rain" aria-hidden="true">
    <span
      v-for="(sym, i) in drops"
      :key="i"
      class="drop"
      :style="sym.style"
    >{{ sym.char }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const SYMBOLS = ['{', '}', '<', '>', '/', '0', '1', '[]', '&&', '||', '=>', '()']
const COUNT = 24

function randBetween(a, b) { return a + Math.random() * (b - a) }

function makeDrop() {
  return {
    char: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    speed: randBetween(0.8, 2.4),
    size: randBetween(10, 16),
  }
}

const drops = ref(Array.from({ length: COUNT }, () => {
  const d = makeDrop()
  return {
    char: d.char,
    style: {
      left: `${d.x}%`,
      top: `${d.y}%`,
      fontSize: `${d.size}px`,
      '--speed': `${d.speed}s`,
      animationDelay: `${-Math.random() * 8}s`,
    }
  }
}))
</script>

<style scoped>
.code-rain {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}
.drop {
  position: absolute;
  color: #ffffff;
  opacity: 0.18;
  font-family: monospace;
  animation: fall var(--speed, 1.5s) linear infinite;
  will-change: transform;
}
@keyframes fall {
  from { transform: translateY(-40px); }
  to   { transform: translateY(100vh); }
}
</style>
