import catalog from '../games.json'
import { pixelIcon, THEMES } from './tiles.js'
import './style.css'

const base = import.meta.env.BASE_URL
const arcade = catalog.filter(game => game.category === 'arcade')
const arcadeReady = arcade.filter(game => game.status === 'playable')
const party = catalog.filter(game => game.category === 'party' && game.status === 'playable')

function themeStyle(name) {
  const theme = THEMES[name]
  return `--tile-bg:${theme.bg};--tile-edge:${theme.edge};--tile-ink:${theme.ink};--tile-text:${theme.text};--tile-chip:${theme.chip}`
}

function tile({ href, theme, wide, badge, kicker, title, description, label }) {
  return `<a class="tile${wide ? ' tile-wide' : ''}" href="${href}" style="${themeStyle(theme)}" aria-label="${label}">
    <span class="tile-badge">${badge}</span>
    <span class="tile-art">${pixelIcon(theme)}</span>
    <span class="tile-text">
      <span class="tile-kicker">${kicker}</span>
      <strong class="tile-title">${title}</strong>
      ${wide ? `<span class="tile-desc">${description}</span>` : ''}
    </span>
  </a>`
}

const tiles = [
  tile({
    href: `${base}arcade/`,
    theme: 'arcade',
    wide: true,
    badge: `${arcadeReady.length} ${arcadeReady.length === 1 ? 'GIOCO' : 'GIOCHI'} · ${arcade.length - arcadeReady.length} IN ARRIVO`,
    kicker: 'SALA ARCADE',
    title: 'ARCADE',
    description: `Cabinati a gettone immaginario: ${arcadeReady.map(game => game.title).join(', ')} e altre avventure in arrivo.`,
    label: `Arcade: ${arcadeReady.map(game => game.title).join(', ')}`,
  }),
  ...party.map(game => tile({
    href: `${base}games/${game.slug}/`,
    theme: game.slug,
    wide: game.tile === 'wide',
    badge: game.players,
    kicker: game.genre,
    title: game.title,
    description: game.description,
    label: `${game.title}: ${game.description}`,
  })),
]

document.querySelector('#games').innerHTML = tiles.join('')
document.querySelector('#year').textContent = new Date().getFullYear()

const playable = catalog.filter(game => game.status === 'playable').length
document.querySelector('.section-label > span').textContent = `${String(playable).padStart(2, '0')} / ${String(catalog.length).padStart(2, '0')} READY`
