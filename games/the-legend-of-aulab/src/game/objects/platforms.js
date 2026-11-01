export function CreaMinus(width = 64) {
  return [
    sprite('minus', { width, height: 64, tiled: true }),
    area({ shape: new Rect(vec2(0), width, 21), offset: vec2(0, -20) }),
    body({ isStatic: true }),
    anchor('bot'),
    'pavimento',
  ]
}
