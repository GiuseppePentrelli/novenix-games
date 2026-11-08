import test from 'node:test'
import assert from 'node:assert/strict'
import { createJumpController, JUMP } from '../src/game/jump-controller.js'
import { compileLevel, LEVEL_ROWS, TILE_SIZE } from '../src/game/level-data.js'

const step = 1 / 50

test('un comando produce un salto e non un secondo salto in aria', () => {
  const input = createJumpController()
  input.step(step, true, 0)
  input.press()
  assert.equal(input.step(step, true, 0).jump, true)
  input.press()
  for (let i = 0; i < 20; i++) assert.equal(input.step(step, false, -100).jump, false)
  assert.equal(input.step(step, true, 0).jump, false)
})

test('la pressione appena prima di atterrare viene recuperata', () => {
  const input = createJumpController()
  input.press()
  for (let i = 0; i < 4; i++) assert.equal(input.step(step, false, 300).jump, false)
  assert.equal(input.step(step, true, 0).jump, true)
})

test('una pressione vecchia non causa un salto involontario all’atterraggio', () => {
  const input = createJumpController()
  input.press()
  for (let i = 0; i < 10; i++) input.step(step, false, 300)
  assert.equal(input.step(step, true, 0).jump, false)
})

test('il margine dopo il bordo permette il salto una volta e scade', () => {
  const input = createJumpController()
  input.step(step, true, 0)
  for (let i = 0; i < 3; i++) input.step(step, false, 30)
  input.press()
  assert.equal(input.step(step, false, 30).jump, true)
  input.press()
  assert.equal(input.step(step, false, -100).jump, false)
  input.clear()
  input.step(step, true, 0)
  for (let i = 0; i < 7; i++) input.step(step, false, 30)
  input.press()
  assert.equal(input.step(step, false, 30).jump, false)
})

test('la pausa cancella i comandi in attesa', () => {
  const input = createJumpController()
  input.step(step, true, 0)
  input.press()
  input.clear()
  assert.equal(input.step(step, true, 0).jump, false)
})

function simulate(refreshRate) {
  const input = createJumpController()
  input.step(step, true, 0)
  input.press()
  let x = 0, y = 0, velocity = 0, accumulator = 0, apex = 0, ticks = 0
  for (let frame = 0; frame < refreshRate; frame++) {
    accumulator += 1 / refreshRate
    while (accumulator + 1e-10 >= step) {
      accumulator -= step
      const next = input.step(step, y === 0 && velocity === 0, velocity)
      if (next.jump) velocity = -JUMP.speed
      velocity += JUMP.gravity * next.gravityScale * step
      y += velocity * step
      x += 400 * step
      apex = Math.min(apex, y)
      if (y > 0) { y = 0; velocity = 0 }
      ticks++
    }
  }
  return { x, y, velocity, apex, ticks }
}

test('la simulazione fissa dà la stessa traiettoria a 30/60/120/144 Hz', () => {
  const baseline = simulate(60)
  assert.equal(baseline.x, 400)
  assert.ok(-baseline.apex > 200 && -baseline.apex < 250)
  for (const rate of [30, 120, 144]) assert.deepEqual(simulate(rate), baseline)
})

test('l’aggregazione conserva ogni tessera, ostacolo e collezionabile del livello', () => {
  const plan = compileLevel()
  const actual = []
  for (const object of plan) {
    if (object.symbol === 'G') continue
    for (let i = 0; i < object.count; i++) actual.push(`${object.symbol}:${object.x / TILE_SIZE + i}:${object.y / TILE_SIZE}`)
  }
  const expected = []
  LEVEL_ROWS.forEach((row, y) => [...row].forEach((symbol, x) => {
    if (symbol !== ' ' && symbol !== 'G') expected.push(`${symbol}:${x}:${y}`)
  }))
  assert.deepEqual(actual.sort(), expected.sort())
  assert.equal(plan.filter(object => object.symbol === 'G').length, 1)
  assert.ok(plan.every(object => object.count <= 8))
  assert.ok(plan.length < 150)
})

test('il caricamento progressivo mantiene un numero limitato di oggetti durante tutta la corsa', () => {
  const plan = compileLevel()
  let cursor = 0, active = [], peak = 0
  for (let player = 150; player < 23000; player += 8) {
    while (cursor < plan.length && plan[cursor].x <= player + 2560) active.push(plan[cursor++])
    active = active.filter(object => object.x + object.count * TILE_SIZE >= player - 1280)
    peak = Math.max(peak, active.length)
  }
  assert.equal(cursor, plan.length)
  assert.ok(peak < 70, `Peak active objects: ${peak}`)
  assert.ok(active.length < 20)
})

test('il livello reale crea e rimuove i blocchi progressivamente senza duplicare il traguardo', async () => {
  const { createLevelStream } = await import('../src/game/level-stream.js')
  const keys = ['add', 'destroy', 'pos', 'sprite', 'area', 'body', 'anchor', 'scale', 'opacity', 'color', 'z', 'vec2', 'Rect', 'width', 'height']
  const saved = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  const roots = []
  function object(components) {
    const item = {
      pos: components.find(component => component?.id === 'pos')?.value || { x: 0, y: 0 },
      components, children: [], alive: true,
      exists() { return this.alive },
      add(components) { const child = object(components); this.children.push(child); return child },
    }
    return item
  }
  try {
    globalThis.add = components => { const item = object(components); roots.push(item); return item }
    globalThis.destroy = item => { item.alive = false }
    globalThis.pos = (x, y) => ({ id: 'pos', value: { x, y } })
    for (const key of ['sprite', 'area', 'body', 'anchor', 'scale', 'opacity', 'color', 'z']) globalThis[key] = (...args) => ({ id: key, args })
    globalThis.vec2 = (x = 0, y = x) => ({ x, y })
    globalThis.Rect = class { constructor(pos, width, height) { Object.assign(this, { pos, width, height }) } }
    globalThis.width = () => 1280
    globalThis.height = () => 720
    const level = createLevelStream(144)
    let peak = 0
    for (let x = 150; x < 23000; x += 40) {
      level.update(x, x + 300)
      peak = Math.max(peak, roots.filter(item => item.exists()).length)
    }
    assert.equal(roots.length, compileLevel().length)
    assert.equal(roots.filter(item => item.components.includes('goal')).length, 1)
    assert.ok(peak <= 45, `Live engine objects: ${peak}`)
    assert.ok(roots.filter(item => item.exists()).length < 20)
    assert.ok(roots.some(item => item.hidden))
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else delete globalThis[key]
    }
  }
})

test('il comando DOM salta subito e i listener vengono rimossi quando esci dal livello', async () => {
  const { Salto } = await import('../src/game/objects/jump.js')
  const keys = ['window', 'Element', 'setGravity', 'dt']
  const saved = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  try {
    globalThis.window = new EventTarget()
    window.isPaused = false
    globalThis.Element = class {}
    globalThis.setGravity = () => {}
    globalThis.dt = () => step
    let grounded = true, jumps = 0, landing, cancelled = false
    const player = {
      vel: { x: 0, y: 0 },
      isGrounded: () => grounded,
      jump(force) { jumps++; grounded = false; this.vel = { x: 0, y: -force } },
      onGround(handler) { landing = handler; return { cancel() { cancelled = true } } },
    }
    const cleanup = Salto(player, 400)
    window.dispatchEvent(new Event('hud:jump'))
    assert.equal(jumps, 1)
    assert.equal(player.vel.x, 400)
    assert.equal(player.vel.y, -JUMP.speed)
    window.dispatchEvent(new Event('hud:jump'))
    assert.equal(jumps, 1)
    grounded = true
    landing()
    assert.equal(jumps, 2)
    cleanup()
    assert.equal(cancelled, true)
    grounded = true
    window.dispatchEvent(new Event('hud:jump'))
    player.controlStep()
    assert.equal(jumps, 2)
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else delete globalThis[key]
    }
  }
})

test('prato e piattaforme vengono disegnati esattamente sopra la loro collisione', async () => {
  const { CreaPrato, CreaMinus } = await import('../src/game/objects/platforms.js')
  const keys = ['drawSprite', 'vec2', 'Rect', 'area', 'body', 'anchor']
  const saved = new Map(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  try {
    const drawn = []
    globalThis.drawSprite = options => drawn.push(options)
    globalThis.vec2 = (x = 0, y = x) => ({ x, y })
    globalThis.Rect = class { constructor(pos, width, height) { Object.assign(this, { pos, width, height }) } }
    for (const key of ['area', 'body', 'anchor']) globalThis[key] = (...args) => ({ id: key, args })
    for (const [create, count] of [[CreaPrato, 1], [CreaPrato, 8], [CreaMinus, 1], [CreaMinus, 8]]) {
      drawn.length = 0
      const components = create(count * TILE_SIZE)
      components.find(component => component?.id === 'tileRow').draw()
      assert.equal(drawn.length, count)
      assert.ok(drawn.every(options => !options.tiled && !options.anchor))
      const left = Math.min(...drawn.map(options => options.pos.x))
      const right = Math.max(...drawn.map(options => options.pos.x)) + TILE_SIZE
      const top = Math.min(...drawn.map(options => options.pos.y))
      const { shape, offset = { x: 0, y: 0 } } = components.find(component => component?.id === 'area').args[0]
      assert.equal(components.find(component => component?.id === 'anchor').args[0], 'bot')
      const box = {
        left: shape.pos.x + offset.x - shape.width / 2,
        top: shape.pos.y + offset.y - shape.height,
      }
      box.right = box.left + shape.width
      box.bottom = box.top + shape.height
      assert.deepEqual([left, right], [box.left, box.right])
      assert.equal(top, -TILE_SIZE)
      assert.ok(box.top >= top && box.bottom <= 0)
      if (create === CreaPrato) assert.deepEqual([box.top, box.bottom], [-TILE_SIZE, 0])
    }
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else delete globalThis[key]
    }
  }
})
