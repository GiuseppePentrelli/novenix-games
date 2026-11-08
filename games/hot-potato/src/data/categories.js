// Categorie e lettere per "Parola a Tempo".
// Ogni categoria ha il proprio set di lettere "sicure": lettere per cui esiste
// quasi certamente una risposta comune in italiano, così non capitano mai
// accoppiate impossibili (es. "Frutta e verdura" + lettera "D").

const CATEGORY_LETTERS = {
  'Cose che si mangiano': 'ABCDFGILMNOPRSTUVZ',
  'Animali': 'ABCDEFGILMOPRSTVZ',
  'Città italiane': 'ABCFGLMNPRSTUV',
  'Nomi di persona': 'ABCDEFGILMNOPRSTUV',
  'Marche di automobili': 'ABCDFHJKLMNOPRSTV',
  'Sport': 'ABCFGHJKNPRSTV',
  'Professioni': 'ABCDEFGIMNOPSTV',
  'Oggetti in cucina': 'ABCFGLMPST',
  'Film': 'ABCDEFGILMNOPRSTUVZ',
  'Cantanti o gruppi musicali': 'ABCEFGIJLMNPRSTUVZ',
  'Colori': 'ABCFGIMNORTV',
  'Paesi del mondo': 'ABCDEFGIJLMNOPRSTUVZ',
  'Personaggi famosi': 'ABCDEFGILMNOPRSTUV',
  'Parti del corpo': 'BCDFGMNOPST',
  'Vestiti e accessori': 'BCFGJMOPST',
  'Cose che si trovano in bagno': 'ABDLPST',
  'Strumenti musicali': 'ABCFOPSTV',
  'Frutta e verdura': 'ABCFIKLMOPRSUZ',
  'Cose fredde': 'ABFGIN',
  'Cose che fanno rumore': 'ACMST',
  'Supereroi o personaggi Marvel/DC': 'BCFHIJSTVW',
  'Materie scolastiche': 'ACDEFGILMRST',
  'Cose che si trovano in valigia': 'ACDMOPSTV',
  'Mezzi di trasporto': 'ABCEMNPST',
  'Cose che volano': 'AEFMPRU',
  'Piatti tipici italiani': 'CGLMOPRT',
  'Cose che si trovano in ufficio': 'CFGMPST',
  'Cartoni animati': 'BDHNPSTW',
  'Cose appiccicose': 'CFGMNS',
  'Bevande': 'ABCLSTV',
  'Cose rotonde': 'BLPRST',
  'Insetti': 'ACFGMSVZ',
  'Cose che si trovano al mare': 'ABCOPRSV',
  'Squadre di calcio': 'ABCFIJLMNPRSTUV',
  'Cose che fanno paura': 'BFMRSTZ',
  'Elettrodomestici': 'AFLMTV',
  'Cose che si trovano in montagna': 'ABCNRSV',
  'Parole inglesi comuni': 'ABCDEFGHIJKLMNOPRSTUVW',
  'Cose che si rompono facilmente': 'BCPUV',
  'Attori o attrici': 'ABCDEFGIJLMNOPRSTVW',
}

export const CATEGORIES = Object.keys(CATEGORY_LETTERS)

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randomCategory() {
  return pickRandom(CATEGORIES)
}

export function randomLetterFor(category) {
  const letters = CATEGORY_LETTERS[category] ?? 'ABCDEFGILMNOPRSTUV'
  return pickRandom(letters.split(''))
}

export function randomRound() {
  const category = randomCategory()
  return { category, letters: randomLetterFor(category) }
}
