export function registerLevel0() {
  scene("Level_0", () => {
    window.gamePhase = 'story'
    window.dispatchEvent(new CustomEvent('game:phase', { detail: 'story' }))
    const bg = add([sprite("bg_salon"), pos(0, 0), fixed()])
    const scaleFactor = Math.max(width() / bg.width, height() / bg.height)
    bg.scale = vec2(scaleFactor)

    const player = add([
      sprite("pog"),
      pos(-100, height() - 80),
      anchor("bot"),
      scale(2),
      { targetX: width() * 0.2 },
    ])
    const titolare = add([
      sprite("karat"),
      pos(width() + 100, height() - 80),
      anchor("bot"),
      scale(-2, 2),
      { targetX: width() * 0.8, startMoving: false },
    ])

    onUpdate(() => {
      if (player.pos.x < player.targetX) player.move(150, 0)
      if (titolare.startMoving && titolare.pos.x > titolare.targetX) titolare.move(-150, 0)
    })

    function speak(txt, character, duration = 3) {
      const bubble = add([pos(character.pos.x, character.pos.y - 220), anchor("center"), z(10)])
      bubble.add([rect(280, 110, { radius: 15 }), color(255, 255, 255), outline(3, Color.BLACK), anchor("center")])
      bubble.add([text(txt, { size: 18, width: 250, align: "center" }), color(0, 0, 0), anchor("center")])
      const upd = onUpdate(() => { bubble.pos = character.pos.add(0, -220) })
      wait(duration, () => { destroy(bubble); upd.cancel() })
    }

    function fadeOut(nextScene) {
      const cover = add([rect(width(), height()), color(0, 0, 0), pos(0, 0), opacity(0), z(100)])
      onUpdate(() => {
        if (cover.opacity < 1) cover.opacity += dt() * 0.5
        else go(nextScene)
      })
    }

    wait(1, () => {
      wait(1.5, () => {
        speak("Oh no... Ancora le 20.00.\nVoglio tornare a casa....", player, 3)
        wait(3.5, () => {
          titolare.startMoving = true
          wait(2, () => {
            shake(15)
            speak("CHI HA PULITO QUII????", titolare, 2)
            wait(2.5, () => {
              shake(25)
              speak("C'è qualche micron di polvere! Non mi interessa che sei già a 8 ore di straordinari! Pulisci o sei licenziato!!!", titolare, 5)
              wait(6.5, () => {
                speak("Quanto vorrei cambiare lavoro...", player, 3)
                wait(3.5, () => fadeOut("ArrivoDocenti"))
              })
            })
          })
        })
      })
    })
  })
}
