const STORAGE_KEY = 'top10quiz:state'

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // storage non disponibile (es. navigazione privata): il gioco funziona
    // comunque, semplicemente senza persistenza/sincronizzazione
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignorato
  }
}

// notifica le altre schede/finestre sulla stessa origine quando lo stato
// cambia (usato per sincronizzare la schermata giocatori con quella host)
export function subscribeState(callback) {
  function handler(e) {
    if (e.key !== STORAGE_KEY) return
    try {
      callback(e.newValue ? JSON.parse(e.newValue) : null)
    } catch {
      // ignorato
    }
  }
  window.addEventListener('storage', handler)
  return () => window.removeEventListener('storage', handler)
}
