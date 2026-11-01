import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const DIFFICULTIES = {
  easy:   { label: 'EASY',   speed: 280, lives: 5, color: '#00ff88' },
  normal: { label: 'NORMAL', speed: 400, lives: 3, color: '#ffdd00' },
  hard:   { label: 'HARD',   speed: 520, lives: 1, color: '#ff4444' },
}

export const useGameStore = defineStore('game', () => {

  const screen = ref('start')

  const playerName = ref('')
  const difficulty = ref('normal')
  const lives = ref(3)
  const coins = ref(0)
  const deaths = ref(0)
  const finalCoins = ref(0)

  let saved = {}
  try {
    const parsed = JSON.parse(localStorage.getItem('aulab_scores') || '{}')
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      saved = Object.fromEntries(Object.entries(parsed).filter(([, value]) =>
        value && Number.isInteger(value.coins) && value.coins >= 0 && Number.isInteger(value.deaths) && value.deaths >= 0,
      ))
    }
  } catch {}
  const highScores = ref(saved)

  const diffConfig = computed(() => DIFFICULTIES[difficulty.value])

  function saveHighScore() {
    const key = playerName.value.toUpperCase()
    const prev = highScores.value[key]
    if (!prev || coins.value > prev.coins) {
      highScores.value[key] = { coins: coins.value, deaths: deaths.value }
      try { localStorage.setItem('aulab_scores', JSON.stringify(highScores.value)) } catch {}
    }
  }

  function resetRun() {
    lives.value = diffConfig.value.lives
    coins.value = 0
    deaths.value = 0
  }

  return {
    screen,
    playerName,
    difficulty,
    lives,
    coins,
    deaths,
    finalCoins,
    highScores,
    diffConfig,
    saveHighScore,
    resetRun,
  }
})
