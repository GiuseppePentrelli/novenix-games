let music = null
let active = false

function track() {
  if (!music) {
    music = new Audio(`${import.meta.env.BASE_URL}sounds/Intro.mp3`)
    music.loop = true
    music.volume = 0.4
  }
  return music
}

export function playMenuMusic() {
  active = true
  const audio = track()
  if (audio.paused) audio.play().catch(() => {})
}

export function pauseMenuMusic(paused) {
  if (!active || !music) return
  if (paused) music.pause()
  else music.play().catch(() => {})
}

export function stopMenuMusic() {
  active = false
  if (!music) return
  music.pause()
  music.currentTime = 0
}
