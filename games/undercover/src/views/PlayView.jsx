import { useEffect, useState } from 'react'
import { useGame } from '../context/GameContext.jsx'
import LocationPicker from './LocationPicker.jsx'

function formatRemaining(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const mm = String(Math.floor(total / 60)).padStart(2, '0')
  const ss = String(total % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export default function PlayView() {
  const { state, myId, dispatchGameAction } = useGame()
  const { round, players } = state
  const [, forceTick] = useState(0)
  const [clueWord, setClueWord] = useState('')
  const [accusing, setAccusing] = useState(false)
  const [guessing, setGuessing] = useState(false)
  const [peeking, setPeeking] = useState(false)
  const [dismissedVerdictTs, setDismissedVerdictTs] = useState(null)

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const currentPlayerId = round.turnOrder[round.currentTurnIndex]
  const currentPlayer = players.find((p) => p.id === currentPlayerId)
  const isMyTurn = currentPlayerId === myId
  const isSpy = round.spyId === myId
  const myRole = round.assignments[myId]
  const remaining = formatRemaining(round.endsAt - Date.now())
  const verdict = round.lastVerdict && round.lastVerdict.ts !== dismissedVerdictTs ? round.lastVerdict : null
  const verdictText =
    verdict?.outcome === 'no-consensus'
      ? `Il gruppo non si è trovato d'accordo su ${verdict.accusedName}. Si continua.`
      : verdict
        ? `${verdict.accusedName} non era la spia. Al gruppo sono tolti ${Math.round(verdict.penaltyMs / 1000)} secondi.`
        : ''

  const submitClue = (e) => {
    e.preventDefault()
    if (!clueWord.trim()) return
    dispatchGameAction({ type: 'SUBMIT_CLUE', payload: { word: clueWord.trim() } })
    setClueWord('')
  }

  const accuse = (accusedId) => {
    setAccusing(false)
    dispatchGameAction({ type: 'CALL_ACCUSATION', payload: { accuserId: myId, accusedId } })
  }

  const guessLocation = (locationId) => {
    setGuessing(false)
    dispatchGameAction({ type: 'SPY_GUESS', payload: { locationId } })
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.2rem 0' }}>
        <span className="eyebrow">Interrogatorio</span>
        <span
          style={{
            fontFamily: "'Big Shoulders Stencil', sans-serif",
            fontSize: '1.6rem',
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--stamp)',
          }}
        >
          {remaining}
        </span>
      </div>

      {verdict ? (
        <div
          className="card"
          style={{
            padding: '0.8rem 1rem',
            marginBottom: '1rem',
            borderColor: 'var(--stamp)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.8rem',
          }}
        >
          <p style={{ fontSize: '0.85rem' }}>{verdictText}</p>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '0.3em 0.6em', fontSize: '0.7rem' }}
            onClick={() => setDismissedVerdictTs(verdict.ts)}
          >
            OK
          </button>
        </div>
      ) : null}

      <div className="card" style={{ padding: '1.2rem 1.4rem', marginBottom: '1rem' }}>
        {isMyTurn ? (
          <>
            <span className="tab-label" style={{ marginBottom: '0.8rem', display: 'inline-block' }}>
              Tocca a te
            </span>
            <form onSubmit={submitClue} style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                type="text"
                autoFocus
                placeholder="Una parola…"
                value={clueWord}
                maxLength={30}
                onChange={(e) => setClueWord(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--bg-soft)',
                  border: '1px solid var(--card-line)',
                  color: 'var(--ink)',
                  padding: '0.7em 0.8em',
                }}
              />
              <button className="btn btn-primary" type="submit" disabled={!clueWord.trim()}>
                Dì
              </button>
            </form>
          </>
        ) : (
          <p>
            Tocca a <b>{currentPlayer?.name ?? '?'}</b>
            <span className="spinner-dot" style={{ marginLeft: '0.5em' }} />
          </p>
        )}
      </div>

      <div className="card" style={{ padding: '1.1rem 1.3rem', flex: 1, overflowY: 'auto', marginBottom: '1rem', minHeight: '160px' }}>
        <span className="tab-label" style={{ marginBottom: '0.8rem', display: 'inline-block' }}>
          Indizi
        </span>
        {round.clues.length === 0 ? (
          <p className="notice">Nessun indizio ancora. Si comincia.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {round.clues.map((c, i) => (
              <li key={i} style={{ fontSize: '0.9rem' }}>
                <b>{c.playerName}:</b> {c.word}
              </li>
            ))}
          </ul>
        )}
      </div>

      {accusing ? (
        <div className="card" style={{ padding: '1.1rem', marginBottom: '1rem' }}>
          <span className="tab-label" style={{ marginBottom: '0.8rem', display: 'inline-block' }}>
            Chi sospetti?
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {players
              .filter((p) => p.id !== myId)
              .map((p) => (
                <button key={p.id} type="button" className="btn btn-ghost" onClick={() => accuse(p.id)}>
                  {p.name}
                </button>
              ))}
          </div>
          <button className="btn btn-ghost" type="button" style={{ marginTop: '0.6rem', width: '100%' }} onClick={() => setAccusing(false)}>
            Annulla
          </button>
        </div>
      ) : null}

      {guessing ? <LocationPicker onPick={guessLocation} onCancel={() => setGuessing(false)} /> : null}

      {!accusing && !guessing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          <button className="btn btn-ghost" type="button" onClick={() => setPeeking(true)}>
            Rivedi il tuo fascicolo
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => setAccusing(true)}>
            Accusa qualcuno
          </button>
          {isSpy ? (
            <button className="btn btn-primary" type="button" onClick={() => setGuessing(true)}>
              Credo di sapere il luogo
            </button>
          ) : null}
        </div>
      ) : null}

      {peeking ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setPeeking(false)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setPeeking(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 95,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="card"
            style={{
              padding: '1.6rem',
              textAlign: 'center',
              maxWidth: '320px',
              border: `2px solid ${isSpy ? 'var(--stamp)' : 'var(--card-line)'}`,
            }}
          >
            {isSpy ? (
              <>
                <span className="eyebrow">Ruolo assegnato</span>
                <h4 style={{ fontSize: '1.7rem', margin: '0.6rem 0', color: 'var(--stamp)' }}>Sei tu la spia</h4>
                <p className="notice">Non conosci il luogo. Continua a bluffare.</p>
              </>
            ) : (
              <>
                <span className="eyebrow">Luogo assegnato</span>
                <h4 style={{ fontSize: '1.7rem', margin: '0.6rem 0' }}>{round.locationName}</h4>
                <p className="notice">Il tuo ruolo: {myRole}</p>
              </>
            )}
            <button className="btn btn-ghost" type="button" style={{ marginTop: '1.2rem', width: '100%' }} onClick={() => setPeeking(false)}>
              Chiudi
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
