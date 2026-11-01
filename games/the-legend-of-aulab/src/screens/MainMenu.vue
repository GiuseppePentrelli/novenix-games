<template>
  <div class="menu-screen" @click="goNext" @keydown.enter="goNext" tabindex="0" ref="el">
    <CodeRain />
    <div class="frame frame-top" />
    <div class="frame frame-bot" />
    <div class="frame frame-left" />
    <div class="frame frame-right" />

    <div class="content">
      <h1 class="title">THE LEGEND<br>OF AULAB</h1>
      <div class="boss-area">
        <div class="player-name">{{ store.playerName }}</div>
      </div>

      <div class="team">
        <div v-for="(m, i) in team" :key="m.name" class="member" :style="{ animationDelay: `${i * 0.25}s` }">
          <div class="avatar">{{ m.emoji }}</div>
          <span>{{ m.name }}</span>
        </div>
      </div>

      <p class="blink press">PRESS ENTER O TOCCA PER INIZIARE</p>
      <div v-if="topScores.length" class="scores">
        <div class="scores-title">🏆 TOP SCORES</div>
        <div v-for="s in topScores" :key="s.name" class="score-row">
          <span class="score-name">{{ s.name }}</span>
          <span class="score-val">{{ s.coins }}🪙</span>
        </div>
      </div>

      <div class="version">POWERED BY GIUSEPPE PENTRELLI — VER 2.0</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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

const topScores = computed(() =>
  Object.entries(store.highScores)
    .map(([name, v]) => ({ name, coins: v.coins }))
    .sort((a, b) => b.coins - a.coins)
    .slice(0, 5)
)

function goNext() { store.screen = 'difficulty' }

onMounted(() => {
  el.value?.focus()

})
</script>

<style scoped>
.menu-screen {
  position: absolute;
  inset: 0;
  background: #0a0f28;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: monospace;
  z-index: 10;
  cursor: pointer;
  outline: none;
}
.frame {
  position: absolute;
  background: #ffd700;
  z-index: 5;
}
.frame-top    { top: 0; left: 0; right: 0; height: 5px; }
.frame-bot    { bottom: 0; left: 0; right: 0; height: 5px; }
.frame-left   { top: 0; left: 0; bottom: 0; width: 5px; }
.frame-right  { top: 0; right: 0; bottom: 0; width: 5px; }

.content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  width: 100%;
}
.title {
  color: #ffd700;
  font-size: clamp(1.8rem, 6vw, 3.5rem);
  text-align: center;
  text-shadow: 0 0 24px #ffd70055;
  line-height: 1.1;
  letter-spacing: 2px;
}
.boss-area { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
.player-name {
  font-size: clamp(1rem, 3vw, 1.4rem);
  color: #00ffb4;
  animation: wave 1.4s ease-in-out infinite;
  text-shadow: 0 0 10px #00ffb466;
}
@keyframes wave {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-4px); }
}
.team { display: flex; gap: clamp(1rem, 4vw, 3rem); }
.member {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  animation: bob 1.8s ease-in-out infinite;
}
@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
.avatar { font-size: clamp(1.8rem, 5vw, 3rem); }
.member span { color: #c8c8c8; font-size: clamp(0.6rem, 1.5vw, 0.9rem); }

.press { color: #fff; font-size: clamp(0.75rem, 2.5vw, 1.1rem); margin-top: 0.5rem; }
.blink { animation: blink 1.4s ease-in-out infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.1; } }

.scores {
  background: #0d1535;
  border: 2px solid #ffd70055;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  min-width: 200px;
}
.scores-title { color: #ffd700; font-size: 0.85rem; text-align: center; margin-bottom: 0.3rem; }
.score-row { display: flex; justify-content: space-between; color: #aaa; font-size: 0.8rem; }
.score-name { color: #00ffb4; }
.score-val  { color: #ffd700; }

.version {
  margin-top: 1rem;
  color: #fff;
  opacity: 0.4;
  font-size: 0.65rem;
}
</style>
