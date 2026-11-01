import catalog from '../games.json'
import './style.css'

const container = document.querySelector('#games')
for (const [index, game] of catalog.entries()) {
  const ready = game.status === 'playable'
  const article = document.createElement('article')
  article.className = `cabinet ${ready ? 'ready' : 'coming'}`
  article.innerHTML = `
    <div class="cabinet-top"><span>PLAYER ${String(index + 1).padStart(2, '0')}</span><span class="led" aria-hidden="true"></span></div>
    <div class="cabinet-marquee">${ready ? 'THE LEGEND OF AULAB' : 'COMING SOON'}</div>
    <div class="screen-frame"><div class="screen ${ready ? 'adventure' : 'standby'}">
      ${ready ? `<div class="game-logo" aria-hidden="true"><small>THE LEGEND OF</small>AULAB</div><div class="pixel-stars" aria-hidden="true">+ &nbsp; · &nbsp; + &nbsp; ·</div><div class="landscape" aria-hidden="true"><div class="mountain one"></div><div class="mountain two"></div><div class="pixel-moon"></div><div class="pixel-hero"></div><div class="platform p1"></div><div class="platform p2"></div><div class="pixel-coin"></div><div class="ground"></div></div><span class="screen-caption">AN ADVENTURE IN CODE</span>` : `<span class="standby-symbol" aria-hidden="true">${index === 1 ? '?' : '+'}</span><p>NEW GAME<br>LOADING<span class="dots">...</span></p><span class="screen-caption">STAY TUNED</span>`}
    </div></div>
    <div class="control-deck" aria-hidden="true"><span class="joystick"></span><span class="arcade-button yellow"></span><span class="arcade-button pink"></span><span class="deck-lines"></span></div>
    <div class="cabinet-info"><p class="game-type">${ready ? game.genre : `SLOT ${String(index + 1).padStart(2, '0')} / LOCKED`}</p><h3>${game.title}</h3><p class="description">${ready ? game.description : 'Il prossimo viaggio sta prendendo forma. Questo posto è riservato.'}</p>${ready ? `<p class="controls">${game.controls}</p><a class="play" href="${import.meta.env.BASE_URL}games/${game.slug}/"><small>INSERT COIN</small>GIOCA <span aria-hidden="true">▶</span></a>` : '<p class="unavailable">COMING SOON <span aria-hidden="true">▰</span></p>'}<div class="coin-slot" aria-hidden="true"><span></span> NOVENIX</div></div>`
  container.append(article)
}
document.querySelector('#year').textContent = new Date().getFullYear()

const playable = catalog.filter(game => game.status === 'playable').length
document.querySelector('.section-label > span').textContent = `${String(playable).padStart(2, '0')} / ${String(catalog.length).padStart(2, '0')} READY`
