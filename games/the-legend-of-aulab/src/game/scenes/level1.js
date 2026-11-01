import { CreaPlayer } from '../objects/player.js'
import { CreaBug, CreaGlitch, CreaLag } from '../objects/enemies.js'
import { CreaMinus } from '../objects/platforms.js'
import { CreaScenarioEstivo } from '../objects/scenario.js'
import { Salto } from '../objects/jump.js'

let morteCount = 0

export function resetDeathCount() { morteCount = 0 }

export function registerLevel1() {
  scene("Level_1", () => {

    const cfg = window.gameConfig || { speed: 400, lives: 3 }

    if (window.MenuMusic) { window.MenuMusic.stop(); window.MenuMusic = null }
    const musica = play("MusicaMenuPrincipale", { loop: true, volume: 0.5 })
    window.isPaused = false

    const SPEED = cfg.speed
    let vite   = cfg.lives
    let monete = 0

    function emitHUD() {
      window.dispatchEvent(new CustomEvent("game:hud-update", {
        detail: { lives: vite, coins: monete, deaths: morteCount }
      }))
    }
    emitHUD()

    CreaScenarioEstivo()

    const mappaDelLivello = [
      "                                                                                                                                                                                                                                                                                                                                                         G",
      "                                                                                                                                                                                                                                                                                                                            a c c a                      G",
      "                                                                                                                                                                                                     L     %                                                                                                               --------                      G",
      "                                                                                 c                                                                                                            ===================   c                                                                                                    -                               G",
      "                                       c                                    c   --                                                                                     c      --  --  --  --                        ---  c                            == %                                                             -                                 G",
      "                                  c    ==                              c    --                                                                              c     ===========                                          ---  a                       ======                                                           -                                   G",
      "                            c     ==   ==                              --                                                                                 ======                                                          ---  L              ^ ==============                                                    -                              ======= G",
      "            c     ^         ==  L ==   ==           %            %                 ^                                                 c              =====                                                                      =====      L ======================                                             -                           ============= G",
      "========================================= -  ===========LL================^%===============  ====                          a  =============  ====                                                                                     ==================================                   a           c                     ^       =================== G",
      "=========================================    ==============================================  ====   --  --  --   --  --  ==================                                                                                      ===========================================   =====^L==========%%=============  ====  ==================================G",
    ]

    const levelConfig = {
      tileWidth: 64,
      tileHeight: 64,
      pos: vec2(0, height() - mappaDelLivello.length * 64 + 64),
      tiles: {
        "=": () => [sprite("grass"), area(), body({ isStatic: true }), anchor("bot"), "pavimento"],
        "-": () => [...CreaMinus()],
        "^": () => [...CreaBug()],
        "%": () => [...CreaGlitch()],
        "L": () => [...CreaLag()],
        "a": () => [sprite("apple"), area(), body(), anchor("bot"), "mela"],
        "c": () => [sprite("coin"),  area(), body(), anchor("bot"), "moneta"],
        "G": () => [
          sprite("marks_legend"),
          area({ shape: new Rect(vec2(0, -2000), 200, 4000) }),
          anchor("bot"),
          body(),
          "goal",
          {
            add() {
              for (let i = 0; i < 15; i++) {
                add([sprite("sparkling", { anim: "anim" }), pos(this.pos.x, this.pos.y - i * 90), anchor("bot"), scale(2.5), opacity(0.6), color(0, 255, 255)])
              }
            }
          }
        ],
      },
    }

    addLevel(mappaDelLivello, levelConfig)
    const player = CreaPlayer()
    player.pos = vec2(150, height() - 250)
    const cleanupJump = Salto(player)

    const onPause = (e) => {
      window.isPaused = e.detail
      musica.paused = window.isPaused
      getTreeRoot().paused = window.isPaused
    }
    window.addEventListener("hud:pause", onPause)

    onSceneLeave(() => {
      window.removeEventListener("hud:pause", onPause)
      cleanupJump()
      musica.stop()
    })

    player.onCollide("moneta", (c) => {
      destroy(c)
      play("coinSound", { volume: 0.2 })
      monete++
      emitHUD()
    })

    player.onCollide("mela", (m) => {
      destroy(m)
      play("eatApple", { volume: 0.8 })
      if (vite < cfg.lives) { vite++; emitHUD() }
    })

    player.onCollide("enemy", (nemico) => {
      if (window.isPaused) return
      addKaboom(player.pos)
      play("ouch", { volume: 0.8 })
      shake(20)
      destroy(nemico)
      vite--
      emitHUD()
      if (vite <= 0) {
        window.isPaused = true
        morteCount++
        musica.stop()
        play("GameOver", { volume: 0.2 })
        add([text("GAME OVER", { size: 48 }), pos(center()), anchor("center"), fixed(), color(255, 0, 0), z(150)])
        wait(1, () => go("Level_1"))
      } else {
        player.color = rgb(255, 0, 0)
        wait(0.2, () => { player.color = rgb(255, 255, 255) })
      }
    })

    onUpdate(() => {
      if (window.isPaused) return
      player.move(SPEED, 0)
      const targetX = player.pos.x + 300
      setCamPos(lerp(getCamPos().x, targetX, 1 - Math.pow(0.88, dt() * 60)), center().y)

      if (player.pos.y > height() + 600) {
        play("caduta", { volume: 0.6 })
        play("GameOver", { volume: 0.2 })
        morteCount++
        musica.stop()
        window.isPaused = true
        add([text("GAME OVER", { size: 48 }), pos(center()), anchor("center"), fixed(), color(255, 0, 0), z(150)])
        wait(1.5, () => go("Level_1"))
      }
    })

    player.onCollide("goal", () => {
      if (window.isPaused) return
      window.isPaused = true
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
