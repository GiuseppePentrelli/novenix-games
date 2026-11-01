export function Salto(Player) {
  const JUMP_POWER = 1200
  const GRAVITY    = 2300
  const COYOTE_TIME   = 0.1
  const INPUT_BUFFER  = 0.5

  let canJump    = true
  let coyoteTimer = 0
  let jumpBuffer  = 0

  setGravity(GRAVITY)

  const eseguiSalto = () => {
    if (window.isPaused) return
    if (canJump && (Player.isGrounded() || coyoteTimer > 0)) {
      Player.jump(JUMP_POWER)
      canJump = false
      coyoteTimer = 0
      jumpBuffer = 0
    } else {
      jumpBuffer = INPUT_BUFFER
    }
  }

  onKeyPress(["space", "up"], eseguiSalto)
  onMousePress(eseguiSalto)

  window.addEventListener("hud:jump", eseguiSalto)

  onUpdate(() => {
    if (window.isPaused) return
    const dt2 = dt()
    if (!Player.isGrounded()) {
      coyoteTimer -= dt2
    } else {
      canJump = true
      coyoteTimer = COYOTE_TIME
    }

    if (jumpBuffer > 0) {
      jumpBuffer -= dt2
      if (canJump && Player.isGrounded()) {
        Player.jump(JUMP_POWER)
        jumpBuffer = 0
        canJump = false
        coyoteTimer = 0
      }
    }

    if (!Player.isGrounded() && Player.vel.y > 0) Player.vel.y += 6000 * dt2
    if (!Player.isGrounded() && Player.vel.y < 0) Player.vel.y *= Math.pow(0.985, dt2 * 60)
  })

  return () => window.removeEventListener("hud:jump", eseguiSalto)
}
