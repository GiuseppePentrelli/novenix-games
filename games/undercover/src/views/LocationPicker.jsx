import { LOCATIONS } from '../data/locations'

export default function LocationPicker({ onPick, onCancel }) {
  return (
    <div className="card" style={{ padding: '1.2rem', marginTop: '1rem' }}>
      <span className="tab-label" style={{ marginBottom: '0.9rem', display: 'inline-block' }}>
        Qual è il luogo?
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1rem' }}>
        {LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: '0.68rem', padding: '0.9em 0.6em' }}
            onClick={() => onPick(loc.id)}
          >
            {loc.name}
          </button>
        ))}
      </div>
      <button className="btn btn-ghost" type="button" onClick={onCancel} style={{ width: '100%' }}>
        Annulla
      </button>
    </div>
  )
}
