// parole senza significato proprio: articoli, preposizioni, verbi essere/avere,
// pronomi... vengono ignorate nel confronto. "non" resta perche' cambia il
// senso della frase (negazione).
const STOPWORDS = new Set([
  'il', 'lo', 'la', 'i', 'gli', 'le',
  'un', 'uno', 'una',
  'del', 'dello', 'della', 'dei', 'degli', 'delle',
  'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra',
  'e', 'o', 'ma', 'che', 'anche',
  'ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno',
  'sono', 'sei', 'siamo', 'siete',
  'mi', 'ti', 'si', 'ci', 'vi', 'ne',
  'the',
])

function stripAccents(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// scompone il testo in parole "di contenuto" (minuscolo, senza accenti,
// senza punteggiatura, senza stopword)
export function tokenize(text) {
  if (!text) return []
  return stripAccents(text.toLowerCase())
    .replace(/'/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
}

// true se guess contiene (in qualsiasi ordine, con parole extra ammesse)
// tutte le parole di contenuto della risposta o di uno dei suoi sinonimi
export function isMatch(guess, item) {
  const guessTokens = new Set(tokenize(guess))
  if (guessTokens.size === 0) return false

  const candidates = [item.answer, ...(item.synonyms || [])]
  return candidates.some((candidate) => {
    const candidateTokens = tokenize(candidate)
    if (candidateTokens.length === 0) return false
    return candidateTokens.every((t) => guessTokens.has(t))
  })
}
