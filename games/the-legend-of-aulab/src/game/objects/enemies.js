export function CreaBug() {
  return [
    sprite("beantle"),
    area(),
    body({ isStatic: true }),
    anchor("bot"),
    "enemy",
  ]
}

export function CreaGlitch() {
  return [
    sprite("ghosty"),
    area(),
    anchor("bot"),
    body(),
    "glitch",
    "enemy",
  ]
}

export function CreaLag() {
  return [
    sprite("gigagantrum"),
    area(),
    body(),
    z(50),
    anchor("bot"),
    scale(0.5),
    "enemy",
    "lag",
  ]
}
