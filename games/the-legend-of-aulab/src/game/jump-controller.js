export const JUMP = Object.freeze({ speed: 1200, gravity: 3000, fallGravity: 6500, coyote: 0.1, buffer: 0.14 })

export function createJumpController() {
  let buffered = 0
  let grace = 0
  let available = false

  return {
    press() { buffered = JUMP.buffer },
    clear() { buffered = 0; grace = 0; available = false },
    step(delta, grounded, verticalSpeed) {
      if (grounded) {
        grace = JUMP.coyote
        available = true
      }
      const jump = buffered > 0 && available && (grounded || grace > 0)
      if (jump) {
        buffered = 0
        grace = 0
        available = false
      } else {
        buffered = Math.max(0, buffered - delta)
        if (!grounded) grace = Math.max(0, grace - delta)
      }
      return { jump, gravityScale: !jump && verticalSpeed > 0 ? JUMP.fallGravity / JUMP.gravity : 1 }
    },
  }
}
