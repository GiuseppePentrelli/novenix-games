import { TILE_SIZE } from '../level-data.js'

// KAPLAY 3001 ignora anchor e pos negli sprite `tiled`: le tessere vanno disegnate una per una
export function tileRow(name, count) {
  return {
    id: 'tileRow',
    draw() {
      for (let i = 0; i < count; i++) drawSprite({ sprite: name, pos: vec2((i - count / 2) * TILE_SIZE, -TILE_SIZE) })
    },
  }
}

export function CreaPrato(width = TILE_SIZE) {
  return [
    tileRow('grass', width / TILE_SIZE),
    area({ shape: new Rect(vec2(0), width, TILE_SIZE) }),
    body({ isStatic: true }),
    anchor('bot'),
    'pavimento',
  ]
}

export function CreaMinus(width = TILE_SIZE) {
  return [
    tileRow('minus', width / TILE_SIZE),
    area({ shape: new Rect(vec2(0), width, 21), offset: vec2(0, -20) }),
    body({ isStatic: true }),
    anchor('bot'),
    'pavimento',
  ]
}
