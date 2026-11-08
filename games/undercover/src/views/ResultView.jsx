import { useGame } from '../context/GameContext.jsx'

function reasonText(result) {
  switch (result.reason) {
    case 'spia-abbandona':
      return 'La spia ha abbandonato la stanza.'
    case 'spia-indovina':
      return 'La spia ha indovinato il luogo segreto.'
    case 'spia-sbaglia':
      return 'La spia ha sbagliato il luogo.'
    case 'tempo-scaduto':
      return 'Il tempo a disposizione è scaduto senza che la spia venisse stanata.'
    default:
      return ''
  }
}

export default function ResultView() {
  const { state, isHost, dispatchGameAction } = useGame()
  const { result, players } = state
  const spy = players.find((p) => p.id === result.revealedSpyId)
  const won = result.winner === 'civili' ? 'I COMPLICI' : 'LA SPIA'

  return (
    <div className="screen" style={{ justifyContent: 'center', textAlign: 'center' }}>
      <span className="eyebrow">Verdetto</span>
      <h1
        style={{
          fontSize: 'clamp(2.2rem, 12vw, 3rem)',
          margin: '0.6rem 0 1rem',
          color: result.winner === 'civili' ? 'var(--good)' : 'var(--stamp)',
        }}
      >
        Vince
        <br />
        {won}
      </h1>
      <p style={{ marginBottom: '1.6rem' }}>{reasonText(result)}</p>

      <div className="card" style={{ padding: '1.2rem 1.4rem', marginBottom: '1.6rem', textAlign: 'left' }}>
        <p style={{ marginBottom: '0.5rem' }}>
          <span className="tab-label">Spia</span> <b>{spy?.name}</b>
        </p>
        <p>
          <span className="tab-label">Luogo</span> <b>{result.locationName}</b>
        </p>
      </div>

      {isHost ? (
        <button className="btn btn-primary btn-lg" type="button" onClick={() => dispatchGameAction({ type: 'REMATCH', payload: {} })}>
          Rigioca →
        </button>
      ) : (
        <p className="notice">
          In attesa che l'host apra una nuova indagine
          <span className="spinner-dot" style={{ marginLeft: '0.5em' }} />
        </p>
      )}
    </div>
  )
}
