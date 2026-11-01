import { createServer } from 'vite'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import http from 'node:http'

const root = resolve(import.meta.dirname, '..')
const catalog = JSON.parse(await readFile(resolve(root, 'games.json'), 'utf8'))
const proxy = {}
const servers = []
for (const [index, game] of catalog.filter(game => game.status === 'playable').entries()) {
  const base = `/novenix-games/games/${game.slug}/`
  const server = await createServer({ root: resolve(root, 'games', game.slug), base, server: { host: '127.0.0.1', port: 5180 + index, strictPort: true, hmr: false } })
  await server.listen()
  servers.push(server)
  proxy[base] = { target: `http://127.0.0.1:${5180 + index}`, agent: new http.Agent() }
}
const hall = await createServer({ root, server: { host: '0.0.0.0', port: 5173, strictPort: true, proxy } })
await hall.listen()
hall.printUrls()
async function close() {
  await Promise.all([...servers, hall].map(server => server.close()))
  process.exit()
}
process.on('SIGINT', close)
process.on('SIGTERM', close)
