import { useState } from 'react'
import { useGame } from '../context/GameContext.jsx'

export default function RoleView({ onContinue }) {
  const { state, myId } = useGame()
  const [open, setOpen] = useState(false)
  const { round } = state
  const isSpy = round.spyId === myId
  const role = round.assignments[myId]

  return (
    <div className="screen" style={{ justifyContent: 'center' }}>
      <span className="eyebrow" style={{ textAlign: 'center' }}>
        Reperto personale
      </span>
      <h2 style={{ fontSize: '1.7rem', textAlign: 'center', margin: '0.4rem 0' }}>Apri il tuo fascicolo</h2>
      <p className="notice" style={{ textAlign: 'center' }}>Tocca la carta. Non farla vedere a nessuno.</p>

      <div className="phone">
        <div className="phone-inner">
          <div
            className={`flip-card${open ? ' open' : ''}`}
            role="button"
            tabIndex={0}
            aria-pressed={open}
            onClick={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpen(true)
              }
            }}
          >
            <div className="face face-front">
              <div className="fp">&#10021;</div>
              <div className="ft">Strettamente confidenziale</div>
              <div className="fs">Tocca per aprire</div>
            </div>
            <div className={`face face-back${isSpy ? ' spy' : ''}`}>
              {isSpy ? (
                <>
                  <span className="eyebrow">Ruolo assegnato</span>
                  <h4>Sei tu la spia</h4>
                  <p>Non conosci il luogo. Ascolta gli indizi, improvvisa i tuoi, e prova a indovinarlo prima che ti scoprano.</p>
                </>
              ) : (
                <>
                  <span className="eyebrow">Luogo assegnato</span>
                  <h4>{round.locationName}</h4>
                  <p>Il tuo ruolo: {role}. Dai indizi legati al luogo senza essere troppo scoperto.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {open ? (
        <button className="btn btn-primary btn-lg" type="button" style={{ marginTop: '1.5rem' }} onClick={onContinue}>
          Ho visto, si comincia →
        </button>
      ) : null}
    </div>
  )
}
