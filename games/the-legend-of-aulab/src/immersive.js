export const touchScreen = matchMedia('(pointer: coarse)')
export const portrait = matchMedia('(orientation: portrait)')

const root = document.documentElement
const request = root.requestFullscreen?.bind(root) ?? root.webkitRequestFullscreen?.bind(root)

export const canGoFullscreen = Boolean(request)

let pending = false

function isFullscreen() {
  return Boolean(document.fullscreenElement ?? document.webkitFullscreenElement)
}

export function enterImmersive() {
  if (!touchScreen.matches || !request || pending || isFullscreen()) return
  pending = true
  let started
  try { started = request({ navigationUI: 'hide' }) } catch { pending = false; return }
  Promise.resolve(started)
    .then(() => screen.orientation?.lock?.('landscape'))
    .catch(() => {})
    .finally(() => { pending = false })
}

export function installImmersive() {
  window.addEventListener('pointerup', (event) => {
    if (event.pointerType !== 'mouse') enterImmersive()
  }, true)
}
