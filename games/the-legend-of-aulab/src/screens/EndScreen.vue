<template>
  <div class="end-screen" @click="goMenu" @keydown.enter="goMenu" tabindex="0" ref="el">
    <CodeRain />
    <div class="content">
      <p class="congrats">GIOCO COMPLETATO!</p>
      <p class="sub">Complimenti, hai conquistato il tuo diploma Aulab.<br>
         Ora hai nuovi poteri: HTML, CSS, JS e PHP.<br>
         Ma è solo l'inizio della tua avventura!</p>
      <div class="diploma">
        <div class="diploma-sidebar">
          <span class="aulab-brand">aulab</span>
        </div>
        <div class="diploma-body">
          <p class="cert-pre">Attestato di</p>
          <p class="cert-title">FULL STACK DEVELOPER</p>
          <p class="cert-to">ALLO STUDENTE</p>
          <p class="cert-name">{{ store.playerName.toUpperCase() }}</p>
          <p class="cert-desc">Per aver conseguito con successo gli obiettivi del corso<br>
             utilizzando HTML, CSS, JS, PHP e Laravel.</p>
          <div class="cert-stats">
            <span>🪙 {{ store.finalCoins }} monete</span>
            <span>💀 {{ store.deaths }} tentativi</span>
            <span>🎮 {{ store.diffConfig.label }}</span>
          </div>
        </div>
      </div>
      <p v-if="isNewRecord" class="new-record">🏆 NUOVO RECORD PERSONALE!</p>

      <div class="team">
        <span v-for="(m, i) in team" :key="m.name" class="avatar" :style="{ animationDelay: `${i * 0.3}s` }">
          {{ m.emoji }}
        </span>
      </div>

      <p class="hint blink">PREMI INVIO O TOCCA PER TORNARE AL MENU</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CodeRain from '../components/CodeRain.vue'
import { useGameStore } from '../store/game'

const store = useGameStore()
const el = ref(null)

const team = [
  { name: 'Valerio', emoji: '🧑‍💻' },
  { name: 'Francesco', emoji: '👨‍🏫' },
  { name: 'Nicola', emoji: '🧑‍🏫' },
  { name: 'Matteo', emoji: '👨‍💻' },
]

const previousScore = store.highScores[store.playerName.toUpperCase()]
const isNewRecord = !previousScore || store.finalCoins > previousScore.coins

function goMenu() {
  store.screen = 'menu'
}

onMounted(() => {
  store.saveHighScore()
  el.value?.focus()

})
</script>

<style scoped>
.end-screen {
  position: absolute;
  inset: 0;
  background: #141414;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  z-index: 10;
  cursor: pointer;
  outline: none;
  overflow-y: auto;
}
.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  max-width: 700px;
  width: 100%;
}
.congrats {
  font-size: clamp(1.4rem, 5vw, 2.2rem);
  color: #00ffb4;
  text-shadow: 0 0 20px #00ffb466;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.04); }
}
.sub { color: #ccc; text-align: center; font-size: clamp(0.75rem, 2vw, 0.95rem); line-height: 1.6; }

.diploma {
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  width: 100%;
  max-width: 580px;
  box-shadow: 0 0 30px #00000080;
  border: 2px solid #aaa;
}
.diploma-sidebar {
  width: 28%;
  background: #ffe600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.aulab-brand {
  color: #000;
  font-size: 1.8rem;
  font-weight: bold;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  letter-spacing: 4px;
}
.diploma-body {
  width: 72%;
  background: #1a1a1a;
  padding: 1.2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.cert-pre   { color: #ffd700; font-size: 0.85rem; }
.cert-title { color: #fff; font-size: clamp(0.9rem, 2.5vw, 1.2rem); font-weight: bold; }
.cert-to    { color: #ffd700; font-size: 0.8rem; margin-top: 0.4rem; }
.cert-name  { color: #fff; font-size: clamp(1.2rem, 3vw, 1.8rem); font-weight: bold; }
.cert-desc  { color: #888; font-size: 0.75rem; line-height: 1.5; }
.cert-stats { display: flex; gap: 1rem; color: #ffd700; font-size: 0.8rem; margin-top: 0.4rem; }

.new-record {
  color: #ffd700;
  font-size: 1rem;
  animation: pulse 1s ease-in-out infinite;
}
.team { display: flex; gap: 1.5rem; }
.avatar {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  animation: pop 1s ease-out both;
}
@keyframes pop {
  from { opacity: 0; transform: scale(0); }
  to   { opacity: 1; transform: scale(1); }
}
.hint { color: #fff; font-size: clamp(0.65rem, 2vw, 0.85rem); }
.blink { animation: blink 1.4s ease-in-out infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
</style>
