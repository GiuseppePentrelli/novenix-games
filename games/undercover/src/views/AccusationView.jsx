import { useGame } from '../context/GameContext.jsx'
import { PHASE } from '../context/gameReducer.js'
import LocationPicker from './LocationPicker.jsx'

export default function AccusationView() {
  const { state, myId, dispatchGameAction } = useGame()
  const { players, accusation, round, phase } = state

  const accuser = players.find((p) => p.id === accusation.accuserId)
  const accused = players.find((p) => p.id === accusation.accusedId)
  const isAccused = myId === accusation.accusedId
  const hasVoted = Boolean(accusation.votes[myId])
  const votesCast = Object.keys(accusation.votes).length
  const votesNeeded = players.length - 1 // everyone but the accused

  const vote = (choice) => {
    dispatchGameAction({ type: 'VOTE_ACCUSATION', payload: { vote: choice } })
  }

  if (phase === PHASE.SPY_GUESS) {
    const isSpy = round.spyId === myId
    return (
      <div className="screen" style={{ justifyContent: 'center', textAlign: 'center' }}>
        <span className="stamp" style={{ margin: '0 auto 1.2rem' }}>
          Smascherato
        </span>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>
          {accused?.name} è la spia
        </h2>
        {isSpy ? (
          <>
            <p className="notice" style={{ marginBottom: '0.5rem' }}>
              Ultima carta: indovina il luogo e ribalta il verdetto.
            </p>
            <LocationPicker
              onPick={(locationId) => dispatchGameAction({ type: 'SPY_GUESS', payload: { locationId } })}
              onCancel={() => {}}
            />
          </>
        ) : (
          <p className="notice">
            La spia ha un'ultima occasione: indovinare il luogo. Attendete il verdetto
            <span className="spinner-dot" style={{ marginLeft: '0.5em' }} />
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="screen" style={{ justifyContent: 'center', textAlign: 'center' }}>
      <span className="eyebrow">Votazione in corso</span>
      <h2 style={{ fontSize: '1.6rem', margin: '0.5rem 0 1.2rem' }}>
        {accuser?.name} accusa {accused?.name}
      </h2>

      {isAccused ? (
        <p className="notice">
          Sei stato accusato. Gli altri stanno decidendo se sei tu la spia
          <span className="spinner-dot" style={{ marginLeft: '0.5em' }} />
        </p>
      ) : hasVoted ? (
        <p className="notice">
          Voto registrato ({votesCast}/{votesNeeded}). In attesa degli altri
          <span className="spinner-dot" style={{ marginLeft: '0.5em' }} />
        </p>
      ) : (
        <>
          <p className="notice" style={{ marginBottom: '1.2rem' }}>
            Serve l'unanimità: se anche uno solo non è convinto, l'accusa cade e si torna a giocare &mdash; ma il tempo perso non torna indietro.
          </p>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button className="btn btn-ghost" type="button" style={{ flex: 1 }} onClick={() => vote('no')}>
              Non è lei
            </button>
            <button className="btn btn-primary" type="button" style={{ flex: 1 }} onClick={() => vote('yes')}>
              È la spia
            </button>
          </div>
        </>
      )}
    </div>
  )
}
