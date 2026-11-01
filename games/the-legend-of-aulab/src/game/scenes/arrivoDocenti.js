export function registerArrivoDocenti() {
  scene("ArrivoDocenti", () => {
    window.gamePhase = 'story'
    window.dispatchEvent(new CustomEvent('game:phase', { detail: 'story' }))
    const streetBg = add([sprite("streetNight"), pos(0, 0), fixed()])
    const scaleFactor = Math.max(width() / streetBg.width, height() / streetBg.height)
    streetBg.scale = vec2(scaleFactor)
    streetBg.pos = vec2(
      (width() - streetBg.width * streetBg.scale.x) / 2,
      (height() - streetBg.height * streetBg.scale.y) / 2,
    )

    const player = add([sprite("pog"), pos(width() * 0.15, height() - 80), anchor("bot"), scale(2)])

    function creaDocente(nomeSprite, xPos) {
      return add([sprite(nomeSprite), pos(xPos, height() - 80), anchor("bot"), scale(2), opacity(0)])
    }
    const valerio  = creaDocente("valerio",   width() * 0.45)
    const nicola   = creaDocente("nicola",    width() * 0.6)
    const francesco= creaDocente("francesco", width() * 0.75)
    const matteo   = creaDocente("matteo",    width() * 0.9)
    const docenti  = [valerio, nicola, francesco, matteo]

    function speak(txt, character, duration = 3, offsetX = 0) {
      const bubble = add([pos(character.pos.x + offsetX, character.pos.y - 200), anchor("center"), z(50)])
      bubble.add([rect(350, 130, { radius: 15 }), color(255, 255, 255), outline(4, Color.BLACK), anchor("center")])
      bubble.add([text(txt, { size: 22, width: 310, align: "center", lineSpacing: 8 }), color(0, 0, 0), anchor("center")])
      const upd = onUpdate(() => { bubble.pos = character.pos.add(offsetX, -200) })
      wait(duration, () => { destroy(bubble); upd.cancel() })
    }

    wait(1.5, () => {
      speak("Io voglio cambiare lavoro... Ma come?", player, 3, 150)
      wait(3.5, () => {
        speak("Come posso fare? Sono condannato...", player, 3, 150)
        wait(3.5, () => {
          docenti.forEach((d, i) => { wait(i * 0.5, () => { d.opacity = 1 }) })
          wait(2.5, () => {
            speak("Ciao Giuseppe! Noi siamo Valerio, Francesco, Matteo e Nicola e siamo i docenti Aulab.", valerio, 3, -150)
            wait(3.5, () => {
              speak("Puoi dare una svolta alla tua vita con l'Hackademy!", nicola, 3, -150)
              wait(3.5, () => {
                speak("Insieme impareremo gli strumenti per cambiare il tuo futuro.", francesco, 3, -150)
                wait(3.5, () => {
                  speak("Sei pronto per questa avventura?", matteo, 3, -150)
                  wait(4, () => {
                    const cover = add([rect(width(), height()), color(0, 0, 0), opacity(0), z(100)])
                    onUpdate(() => {
                      cover.opacity += dt() * 0.6
                      if (cover.opacity >= 1) go("Tutorial")
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
}
