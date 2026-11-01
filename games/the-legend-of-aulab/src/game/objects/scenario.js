export function CreaScenarioEstivo() {
  onUpdate('decorazione-schermo', (object) => {
    if (object.pos.y > height() + 100) destroy(object)
  })
  onUpdate('decorazione', (object) => {
    if (object.pos.x < getCamPos().x - width() - 400 || object.pos.y > height() + 100) destroy(object)
  })
  add([
    rect(width(), height()),
    color(135, 206, 235),
    fixed(),
    z(-100),
  ])

  loop(rand(10, 20), () => {
    if (window.isPaused) return
    add([
      pos(getCamPos().x + width() + 200, height() - 64),
      polygon([vec2(-200, 0), vec2(0, -rand(150, 300)), vec2(200, 0)]),
      color(100, 130, 150),
      move(LEFT, 20),
      z(-95),
      "decorazione",
    ])
  })

  const soleGroup = add([pos(width() - 150, 100), fixed(), z(-90)])
  soleGroup.add([sprite("sun"), anchor("center"), scale(1.5)])

  loop(0.3, () => {
    if (window.isPaused) return
    add([
      pos(rand(width() - 300, width()), 0),
      fixed(),
      rect(4, 4),
      color(255, 255, 200),
      opacity(0.5),
      move(vec2(-1, 1), rand(100, 200)),
      z(-85),
      "decorazione-schermo",
    ])
  })

  loop(rand(2, 4), () => {
    if (window.isPaused) return
    const cloud = add([
      pos(getCamPos().x + width() + 100, rand(40, 250)),
      move(LEFT, rand(40, 80)),
      scale(rand(0.8, 1.5)),
      opacity(0.8),
      z(-80),
      "decorazione",
    ])
    cloud.add([circle(30), color(255, 255, 255)])
    cloud.add([circle(25), pos(35, -5), color(255, 255, 255)])
    cloud.add([circle(25), pos(-35, -5), color(255, 255, 255)])
  })

  loop(rand(5, 12), () => {
    if (window.isPaused) return
    const uccello = add([
      pos(getCamPos().x + width() + 50, rand(50, 150)),
      move(LEFT, 180),
      z(-75),
      "decorazione",
    ])
    uccello.add([rect(12, 2), rotate(45), color(0, 0, 0), "ala"])
    uccello.add([rect(12, 2), rotate(-45), pos(8, 0), color(0, 0, 0), "ala"])
  })
}
