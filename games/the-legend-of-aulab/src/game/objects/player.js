export function CreaPlayer() {
  const p = add([
    sprite("pog"),
    pos(100, 200),
    area(),
    body(),
    anchor("bot"),
    "player",
    { nome: window.nomeGiocatore || "Player" }
  ])
  onUpdate(() => {
    if (!p.isGrounded()) p.angle += 500 * dt()
  })
  return p
}
