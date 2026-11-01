export function registerTutorial() {
  scene("Tutorial", () => {
    add([rect(width(), height()), color(10, 10, 20), fixed()])
    add([
      text("01010110 01101001 01110010 01110100 01110101 01100001", { size: 14, opacity: 0.1, width: width() }),
      pos(20, 20),
      color(0, 255, 0),
    ])
    add([
      text("INIZIA L'AVVENTURA!", { size: 42, align: "center", width: width() - 40 }),
      pos(width() / 2, 80),
      anchor("top"),
      color(255, 255, 0),
    ])

    const tutorialText = [
      "Supera i livelli per padroneggiare:",
      "HTML, CSS, JS e PHP.",
      "",
      "Ma fai attenzione...",
      "affronterai BUG SPAVENTOSI,",
      "GLITCH DEVASTANTI e LAG SFINENTI!",
      "",
      "Solo i veri coder sopravvivono.",
    ].join("\n")

    add([
      text(tutorialText, { size: 24, width: width() - 100, align: "center", lineSpacing: 10 }),
      pos(width() / 2, 180),
      anchor("top"),
      color(255, 255, 255),
    ])

    const skipLabel = add([
      text("PREMI 'SU' O 'SPAZIO' PER SALTARE GLI OSTACOLI\nPREMI ENTER PER INIZIARE", { size: 20, align: "center" }),
      pos(width() / 2, height() - 80),
      anchor("center"),
      color(0, 255, 0),
    ])

    const SYMBOLS = ["{", "}", "<", ">", "/", "0", "1", "[]", "&&", "||", "=>"]
    for (let i = 0; i < 20; i++) {
      const c = add([
        text(choose(SYMBOLS), { size: rand(10, 16) }),
        pos(rand(0, width()), rand(0, height())),
        color(255, 255, 255),
        opacity(0.2),
      ])
      c.onUpdate(() => {
        c.move(0, rand(30, 60))
        if (c.pos.y > height()) c.pos.y = -20
      })
    }

    onUpdate(() => { skipLabel.opacity = wave(0.2, 1, time() * 5) })

    const startLevel = () => go("Level_1")
    onKeyPress("up", startLevel)
    onKeyPress("enter", startLevel)
    onKeyPress("space", startLevel)
    onMousePress(startLevel)
  })
}
