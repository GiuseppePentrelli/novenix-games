export function CreaMinus() {
  return [
    sprite("minus"),
    area({
      shape: new Rect(vec2(0), 64, 21),
      offset: vec2(0, -20),
    }),
    body({ isStatic: true }),
    anchor("bot"),
    "pavimento",
    "jump_pad",
    {
      add() {
        this.onCollide("player", () => shake(1))
      }
    }
  ]
}
