import kaplay from 'kaplay'
import { loadAssets } from './assets.js'
import { registerLevel0 } from './scenes/level0.js'
import { registerArrivoDocenti } from './scenes/arrivoDocenti.js'
import { registerTutorial } from './scenes/tutorial.js'
import { registerLevel1, resetDeathCount } from './scenes/level1.js'
import { pauseMenuMusic } from '../menu-music.js'

let initialized = false
let playing = false
let startToken = 0

function pauseGame(paused) {
  if (!playing) return
  window.isPaused = paused
  getTreeRoot().paused = paused
  pauseMenuMusic(paused)
  window.dispatchEvent(new CustomEvent('game:pause', { detail: paused }))
}

export function initKaplay() {
  if (initialized) return
  initialized = true

  kaplay({
    touchToMouse: true,
    pixelDensity: 1,
    debug: false,
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
    pauseGame(event.detail)
  })
  window.addEventListener('blur', () => {
    if (playing && !window.isPaused) window.dispatchEvent(new CustomEvent('hud:pause', { detail: true }))
  })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && playing && !window.isPaused) window.dispatchEvent(new CustomEvent('hud:pause', { detail: true }))
  })
  window.addEventListener('hud:skip-intro', () => {
    if (!window.isPaused && ['Level_0', 'ArrivoDocenti'].includes(getSceneName())) go('Level_1')
  })
  window.addEventListener('hud:quit', () => {
    stopGame()
    resetDeathCount()
    window.dispatchEvent(new CustomEvent('game:quit'))
  })
}

export function startGame(config) {
  playing = true
  window.gamePhase = 'story'
  resetDeathCount()
  window.gameConfig = config
  window.isPaused = false
  getTreeRoot().paused = false
  const token = ++startToken
  onLoad(() => { if (playing && token === startToken) go("Level_0") })
}

export function stopGame() {
  if (!initialized) return
  playing = false
  getTreeRoot().paused = false
  window.isPaused = true
  go('Idle')
}
