import kaplay from 'kaplay'
import { loadAssets } from './assets.js'
import { registerLevel0 } from './scenes/level0.js'
import { registerArrivoDocenti } from './scenes/arrivoDocenti.js'
import { registerTutorial } from './scenes/tutorial.js'
import { registerLevel1, resetDeathCount } from './scenes/level1.js'

let initialized = false

export function initKaplay() {
  if (initialized) return
  initialized = true

  kaplay({
    touchToMouse: true,
    width: 1280,
    height: 720,
    letterbox: true,
    stretch: true,
    crisp: true,
    global: true,
    background: [10, 15, 40],
  })

  scene("Idle", () => {})
  loadAssets()
  registerLevel0()
  registerArrivoDocenti()
  registerTutorial()
  registerLevel1()
  window.addEventListener('hud:pause', (event) => {
    window.isPaused = event.detail
    getTreeRoot().paused = event.detail
  })
  window.addEventListener('hud:quit', () => {
    stopGame()
    resetDeathCount()
    window.dispatchEvent(new CustomEvent('game:quit'))
  })
}

export function startGame(config) {
  resetDeathCount()
  window.gameConfig = config
  window.isPaused = false
  getTreeRoot().paused = false
  go("Level_0")
}

export function stopGame() {
  if (!initialized) return
  getTreeRoot().paused = false
  window.isPaused = true
  go('Idle')
}
