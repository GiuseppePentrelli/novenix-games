// Derives the list of yes/no questions from whatever attributes are actually
// present on the loaded characters, so editing characters.json (new hair
// color, new attribute) doesn't require touching this file.

const IGNORED_KEYS = new Set(['id', 'nome', 'img'])

// Phrasing is keyed by attribute name, not by literal value, so a new
// category value (e.g. a new "capelli" color) is picked up automatically.
// Unknown attributes fall back to a generic template.
const ATTRIBUTE_PHRASES = {
  genere: (value) => (value === 'M' ? 'È un uomo?' : value === 'F' ? 'È una donna?' : `Genere: ${value}?`),
  capelli: (value) => (value === 'calvo' ? 'È calvo/a?' : `Ha i capelli ${value}?`),
  barba: () => 'Ha la barba?',
  occhiali: () => 'Porta gli occhiali?',
  cappello: () => 'Indossa un cappello?',
}

function phraseFor(attribute, value) {
  const template = ATTRIBUTE_PHRASES[attribute]
  return template ? template(value) : `${attribute}: ${value}?`
}

export function deriveQuestions(characters) {
  if (!characters?.length) return []

  const keys = new Set()
  characters.forEach((c) => Object.keys(c).forEach((k) => keys.add(k)))
  IGNORED_KEYS.forEach((k) => keys.delete(k))

  const questions = []

  keys.forEach((attribute) => {
    const sample = characters.find((c) => c[attribute] !== undefined)?.[attribute]

    if (typeof sample === 'boolean') {
      questions.push({
        id: `${attribute}:true`,
        attribute,
        value: true,
        text: phraseFor(attribute, true),
      })
      return
    }

    const distinctValues = [...new Set(characters.map((c) => c[attribute]).filter((v) => v !== undefined))]
    distinctValues.forEach((value) => {
      questions.push({
        id: `${attribute}:${value}`,
        attribute,
        value,
        text: phraseFor(attribute, value),
      })
    })
  })

  return questions.sort((a, b) => a.text.localeCompare(b.text, 'it'))
}

// Used by the CPU opponent to auto-answer structured questions truthfully,
// and to filter its candidate set after receiving an answer.
export function matchesQuestion(character, question) {
  return character?.[question.attribute] === question.value
}
