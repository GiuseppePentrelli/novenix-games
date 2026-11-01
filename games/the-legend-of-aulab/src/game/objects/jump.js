import { createJumpController, JUMP } from '../jump-controller.js'

export function Salto(player, speed) {
  const input = createJumpController()
  setGravity(JUMP.gravity)

  const advance = (delta) => {
    if (window.isPaused) return
    const next = input.step(delta, player.isGrounded(), player.vel.y)
    if (next.jump) player.jump(JUMP.speed)
    player.vel.x = speed
    player.gravityScale = next.gravityScale
  }
  const press = () => {
    if (window.isPaused) return
    input.press()
    advance(0)
  }
  const keydown = (event) => {
    if (!['Space', 'ArrowUp'].includes(event.code) || event.repeat) return
    if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select')) return
    event.preventDefault()
    press()
  }
  const pointerdown = (event) => {
    if (event.button !== 0 || event.target.tagName !== 'CANVAS') return
    event.preventDefault()
    press()
  }
  const clear = () => input.clear()

  window.addEventListener('keydown', keydown)
  window.addEventListener('pointerdown', pointerdown)
  window.addEventListener('hud:jump', press)
  window.addEventListener('hud:pause', clear)
  player.controlStep = () => advance(dt())
  const landing = player.onGround(() => advance(0))

  return () => {
    player.controlStep = () => {}
    landing.cancel()
    window.removeEventListener('keydown', keydown)
    window.removeEventListener('pointerdown', pointerdown)
    window.removeEventListener('hud:jump', press)
    window.removeEventListener('hud:pause', clear)
  }
}
