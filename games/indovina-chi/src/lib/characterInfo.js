// Not a real json attribute: added locally by the board to track your own
// elimination picks. Kept out of the generic attribute list and rendered as
// its own distinct badge instead (see CharacterDetailModal).
const IGNORED_KEYS = new Set(['id', 'nome', 'img', 'eliminated'])

// Statements (not questions) describing a character, for the fullscreen
// card-flip view. Keyed by attribute name so new attributes in
// characters.json fall back to a generic "key: value" line automatically.
const ATTRIBUTE_STATEMENTS = {
  genere: (v) => (v === 'M' ? 'Uomo' : v === 'F' ? 'Donna' : `Genere: ${v}`),
  capelli: (v) => `Capelli ${v}`,
  barba: (v) => (v ? 'Ha la barba' : 'Senza barba'),
  occhiali: (v) => (v ? 'Porta gli occhiali' : 'Senza occhiali'),
  cappello: (v) => (v ? 'Indossa un cappello' : 'Senza cappello'),
}

const ATTRIBUTE_ICONS = {
  genere: '🧑',
  capelli: '💇',
  barba: '🧔',
  occhiali: '👓',
  cappello: '🎩',
}

export function describeCharacter(character) {
  if (!character) return []

  return Object.keys(character)
    .filter((key) => !IGNORED_KEYS.has(key))
    .map((key) => {
      const value = character[key]
      const statement = ATTRIBUTE_STATEMENTS[key]
      const text = statement
        ? statement(value)
        : typeof value === 'boolean'
          ? value
            ? key
            : `Non ${key}`
          : `${key}: ${value}`
      return { key, icon: ATTRIBUTE_ICONS[key] ?? '•', text }
    })
}
