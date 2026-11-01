export function CreaPlayer(speed) {
  const player = add([
    pos(100, 200),
    area({ shape: new Rect(vec2(-24, -56), 48, 56) }),
    { id: 'runner', controlStep() {}, fixedUpdate() { this.controlStep() } },
    body({ maxVelocity: 2200, stickToPlatform: false }),
    'player',
    { nome: window.nomeGiocatore || 'Player' },
  ])
  const normalColor = rgb(255, 255, 255)
  player.vel.x = speed
  const visual = player.add([sprite('pog'), pos(0, -30), anchor('center'), rotate(0), color(255, 255, 255)])
  player.onUpdate(() => {
    if (window.isPaused) return
    if (player.isGrounded()) visual.angle = 0
    else visual.angle = (visual.angle + 500 * dt()) % 360
    visual.color = player.color || normalColor
  })
  player.onBeforePhysicsResolve((collision) => {
    if (collision.target.is('moneta') || collision.target.is('mela') || collision.target.is('enemy')) collision.preventResolution()
  })
  return player
}
