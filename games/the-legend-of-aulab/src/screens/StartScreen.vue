<template>
  <div class="start-screen" @click="next" @keydown.enter.prevent="next" @keydown.space.prevent="next" tabindex="0" ref="el">
    <CodeRain />
    <div class="content">
      <h1 class="title">THE LEGEND<br>OF AULAB</h1>
      <p class="blink">PREMI INVIO O TOCCA PER INIZIARE</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import CodeRain from '../components/CodeRain.vue'
import { useGameStore } from '../store/game'

const store = useGameStore()
const el = ref(null)

function next() { store.screen = 'name' }

onMounted(() => {
  el.value?.focus()
})
</script>

<style scoped>
.start-screen {
  position: absolute;
  inset: 0;
  background: #0a0f28;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  outline: none;
  z-index: 10;
}
.content {
  position: relative;
  z-index: 1;
  text-align: center;
  font-family: monospace;
}
.title {
  font-size: clamp(2.2rem, 8vw, 4.5rem);
  color: #ffd700;
  text-shadow: 0 0 20px #ffd70066;
  line-height: 1.15;
  margin-bottom: 2.5rem;
  letter-spacing: 2px;
}
.blink {
  color: #ffffff;
  font-size: clamp(1rem, 3vw, 1.5rem);
  animation: blink 1.2s ease-in-out infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.1; }
}
</style>
