export default function RulesView({ onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg)',
        zIndex: 100,
        overflowY: 'auto',
      }}
    >
      <div className="screen">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.2rem 0 1.5rem' }}>
          <span className="eyebrow">Fascicolo regole</span>
          <button className="btn btn-ghost" type="button" style={{ padding: '0.5em 0.9em' }} onClick={onClose}>
            Chiudi ✕
          </button>
        </div>

        <h2 style={{ fontSize: '1.7rem', marginBottom: '1.2rem' }}>Come si gioca</h2>

        <div className="card" style={{ padding: '1.1rem 1.3rem', marginBottom: '1rem' }}>
          <span className="tab-label" style={{ marginBottom: '0.7rem', display: 'inline-block' }}>
            Obiettivi
          </span>
          <p style={{ marginBottom: '0.6rem' }}>
            <b>I complici</b> (tutti tranne uno) conoscono il luogo segreto e un ruolo al suo interno. Devono capire chi
            è la spia dando indizi che dimostrino di conoscere il luogo, senza essere troppo espliciti.
          </p>
          <p>
            <b>La spia</b> non sa nulla del luogo. Deve fingere di saperlo e intanto cercare di intuirlo dagli indizi
            altrui.
          </p>
        </div>

        <div className="card" style={{ padding: '1.1rem 1.3rem', marginBottom: '1rem' }}>
          <span className="tab-label" style={{ marginBottom: '0.7rem', display: 'inline-block' }}>
            Durante il turno
          </span>
          <p style={{ marginBottom: '0.6rem' }}>
            Si va a turno: chi tocca dice <b>una parola sola</b> legata al luogo, poi si passa. Il giro continua
            finché non succede qualcosa di decisivo.
          </p>
          <p>
            In qualsiasi momento, chiunque può accusare un altro giocatore. La spia, in più, può in qualsiasi momento
            dichiarare "credo di sapere il luogo" e tentare di indovinarlo.
          </p>
        </div>

        <div className="card" style={{ padding: '1.1rem 1.3rem', marginBottom: '1rem' }}>
          <span className="tab-label" style={{ marginBottom: '0.7rem', display: 'inline-block' }}>
            Quando si accusa qualcuno
          </span>
          <p style={{ marginBottom: '0.6rem' }}>
            Si apre una votazione: tutti tranne l'accusato votano "è lei" o "non è lei". Serve l'
            <b>unanimità</b>.
          </p>
          <p style={{ marginBottom: '0.6rem' }}>
            Se non è unanime, oppure l'accusato non era la spia: l'accusa cade, si torna a giocare da dove ci si era
            fermati — ma al gruppo vengono tolti 60 secondi dall'orologio condiviso.
          </p>
          <p>Se è unanime ed era davvero la spia: la spia ha un'ultima carta, deve indovinare il luogo su due piedi.</p>
        </div>

        <div className="card" style={{ padding: '1.1rem 1.3rem', marginBottom: '1rem' }}>
          <span className="tab-label" style={{ marginBottom: '0.7rem', display: 'inline-block' }}>
            Come si vince
          </span>
          <p style={{ marginBottom: '0.5rem' }}>
            <b>Vincono i complici</b> se la spia (beccata o di sua iniziativa) prova a indovinare il luogo e sbaglia,
            oppure se la spia abbandona la stanza.
          </p>
          <p>
            <b>Vince la spia</b> se indovina il luogo, oppure se il tempo scade senza che sia successo niente di
            decisivo.
          </p>
        </div>

        <p className="notice">Un'accusa sbagliata non fa perdere nessuno — costa solo tempo prezioso.</p>
      </div>
    </div>
  )
}
