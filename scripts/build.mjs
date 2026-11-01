import { build } from 'vite'
import { readFile, mkdir, cp } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const games = JSON.parse(await readFile(resolve(root, 'games.json'), 'utf8'))
await build({ root })
for (const game of games.filter(game => game.status === 'playable')) {
  const folder = resolve(root, 'games', game.slug)
  await build({ root: folder, base: `/novenix-games/games/${game.slug}/` })
  const destination = resolve(root, 'dist/games', game.slug)
  await mkdir(destination, { recursive: true })
  await cp(resolve(folder, 'dist'), destination, { recursive: true })
}
