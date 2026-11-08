import { compileLevel, TILE_SIZE } from './level-data.js'
import { CreaBug, CreaGlitch, CreaLag } from './objects/enemies.js'
import { CreaMinus, CreaPrato } from './objects/platforms.js'

export function createLevelStream(originY) {
  const plan = compileLevel()
  let cursor = 0
  let active = []

  function spawn(tile) {
    const tileWidth = tile.count * TILE_SIZE
    const x = tile.x + (tile.count - 1) * TILE_SIZE / 2
    const y = originY + tile.y
    let components
    switch (tile.symbol) {
      case '=': components = CreaPrato(tileWidth); break
      case '-': components = CreaMinus(tileWidth); break
      case '^': components = CreaBug(); break
      case '%': components = CreaGlitch(); break
      case 'L': components = CreaLag(); break
      case 'a':
      case 'c':
        components = [sprite(tile.symbol === 'a' ? 'apple' : 'coin'), area({ collisionIgnore: ['mela', 'moneta', 'enemy'] }), body(), anchor('bot'), tile.symbol === 'a' ? 'mela' : 'moneta']
        break
      case 'G': {
        const goal = add([pos(tile.x, 0), area({ shape: new Rect(vec2(-100, -1000), 200, 2400) }), 'goal'])
        goal.add([sprite('marks_legend'), pos(0, height() - TILE_SIZE), anchor('bot')])
        for (let i = 0; i < 8; i++) goal.add([sprite('sparkling', { anim: 'anim' }), pos(0, height() - TILE_SIZE - i * 90), anchor('bot'), scale(2.5), opacity(0.6), color(0, 255, 255)])
        return goal
      }
      default: throw new Error(`Unknown level tile: ${tile.symbol}`)
    }
    return add([pos(x, y), ...components])
  }

  return {
    update(playerX, cameraX) {
      const spawnLimit = playerX + width() * 2
      while (cursor < plan.length && plan[cursor].x <= spawnLimit) {
        const tile = plan[cursor++]
        active.push({ object: spawn(tile), left: tile.x - TILE_SIZE / 2, right: tile.x + tile.count * TILE_SIZE })
      }
      const retire = playerX - width()
      const viewLeft = cameraX - width() / 2 - TILE_SIZE
      const viewRight = cameraX + width() / 2 + TILE_SIZE
      active = active.filter((entry) => {
        if (!entry.object.exists()) return false
        if (entry.right < retire || entry.object.pos.y > height() + 800) {
          destroy(entry.object)
          return false
        }
        entry.object.hidden = entry.right < viewLeft || entry.left > viewRight
        return true
      })
    },
  }
}
