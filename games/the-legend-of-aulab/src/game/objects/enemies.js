export function CreaBug() {
  return [
    sprite("beantle"),
    area({ collisionIgnore: ['enemy', 'moneta', 'mela'] }),
    body({ isStatic: true }),
    anchor("bot"),
    "enemy",
  ]
}

export function CreaGlitch() {
  return [
    sprite("ghosty"),
    area({ collisionIgnore: ['enemy', 'moneta', 'mela'] }),
    anchor("bot"),
    body(),
    "glitch",
    "enemy",
  ]
}

export function CreaLag() {
  return [
    sprite("gigagantrum"),
    area({ collisionIgnore: ['enemy', 'moneta', 'mela'] }),
    body(),
    z(50),
    anchor("bot"),
    scale(0.5),
    "enemy",
    "lag",
  ]
}
