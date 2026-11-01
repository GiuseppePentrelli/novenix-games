import { CreaPlayer } from '../objects/player.js'
import { createLevelStream } from '../level-stream.js'
import { LEVEL_ROWS, TILE_SIZE } from '../level-data.js'
import { CreaScenarioEstivo } from '../objects/scenario.js'
import { Salto } from '../objects/jump.js'

let morteCount = 0

export function resetDeathCount() { morteCount = 0 }

export function registerLevel1() {
  scene("Level_1", () => {
    window.gamePhase = 'run'
    window.dispatchEvent(new CustomEvent('game:phase', { detail: 'run' }))

    const cfg = window.gameConfig || { speed: 400, lives: 3 }

    if (window.MenuMusic) { window.MenuMusic.stop(); window.MenuMusic = null }
    const musica = play("MusicaMenuPrincipale", { loop: true, volume: 0.5 })
    window.isPaused = false

    const SPEED = cfg.speed
    let vite   = cfg.lives
    let monete = 0
    let damageCooldown = 0
    let finished = false

    function emitHUD() {
      window.dispatchEvent(new CustomEvent("game:hud-update", {
        detail: { lives: vite, coins: monete, deaths: morteCount }
      }))
    }
    emitHUD()

    CreaScenarioEstivo()

    const level = createLevelStream(height() - LEVEL_ROWS.length * TILE_SIZE + TILE_SIZE)

    const player = CreaPlayer(SPEED)
    player.pos = vec2(150, height() - 250)
    setCamPos(player.pos.x + 300, center().y)
    const cleanupJump = Salto(player, SPEED)
    level.update(player.pos.x, getCamPos().x)

    const onPause = (e) => {
      musica.paused = e.detail
    }
    window.addEventListener("hud:pause", onPause)

    onSceneLeave(() => {
      window.removeEventListener("hud:pause", onPause)
      cleanupJump()
      musica.stop()
    })

    player.onCollide("moneta", (c) => {
      if (window.isPaused || finished) return
      destroy(c)
      play("coinSound", { volume: 0.2 })
      monete++
      emitHUD()
    })

    player.onCollide("mela", (m) => {
      if (window.isPaused || finished) return
      destroy(m)
      play("eatApple", { volume: 0.8 })
      if (vite < cfg.lives) { vite++; emitHUD() }
    })

    player.onCollide("enemy", (nemico) => {
      if (window.isPaused || finished || damageCooldown > 0) return
      damageCooldown = 0.65
      addKaboom(player.pos)
      play("ouch", { volume: 0.8 })
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) shake(8)
      destroy(nemico)
      vite--
      emitHUD()
      if (vite <= 0) {
        finished = true
        window.isPaused = true
        player.paused = true
        morteCount++
        musica.stop()
        play("GameOver", { volume: 0.2 })
        add([text("GAME OVER", { size: 48 }), pos(center()), anchor("center"), fixed(), color(255, 0, 0), z(150)])
        wait(1, () => go("Level_1"))
      } else {
        player.color = rgb(255, 0, 0)
        wait(0.65, () => { player.color = rgb(255, 255, 255) })
      }
    })

    onUpdate(() => {
      if (!window.isPaused && !finished) level.update(player.pos.x, getCamPos().x)
    })

    player.onUpdate(() => {
      if (window.isPaused || finished) return
      damageCooldown = Math.max(0, damageCooldown - dt())
      const targetX = player.pos.x + 300
      setCamPos(lerp(getCamPos().x, targetX, 1 - Math.pow(0.88, dt() * 60)), center().y)

      if (player.pos.y > height() + 600) {
        play("caduta", { volume: 0.6 })
        play("GameOver", { volume: 0.2 })
        finished = true
        morteCount++
        player.paused = true
        musica.stop()
        window.isPaused = true
        add([text("GAME OVER", { size: 48 }), pos(center()), anchor("center"), fixed(), color(255, 0, 0), z(150)])
        wait(1.5, () => go("Level_1"))
      }
    })

    player.onCollide("goal", () => {
      if (window.isPaused || finished) return
      finished = true
      window.isPaused = true
      player.vel = vec2(0)
      player.paused = true
      musica.volume = 0.1
      play("win", { volume: 0.8 })
      add([
        text(`MISSIONE COMPIUTA!\nMonete: ${monete}`, { size: 48, align: "center" }),
        pos(center()), anchor("center"), fixed(), z(101), color(0, 255, 180),
      ])
      add([rect(width(), height()), color(0, 0, 0), opacity(0.8), fixed(), z(100)])
      wait(3, () => {
        musica.stop()
        const deaths = morteCount
        morteCount = 0
        window.dispatchEvent(new CustomEvent("game:win", { detail: { coins: monete, deaths } }))
      })
    })
  })
}
