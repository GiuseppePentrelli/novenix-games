// Helpers for turning a short, human-typeable room code into a PeerJS peer id.
// Namespaced with a prefix so this app's rooms don't collide with unrelated
// apps sharing the same public PeerJS cloud broker.

const ROOM_PREFIX = 'indovina-chi-'
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I, easy to read aloud

export function generateRoomCode(length = 5) {
  let code = ''
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return code
}

export function roomCodeToPeerId(code) {
  return `${ROOM_PREFIX}${code.trim().toUpperCase()}`
}
