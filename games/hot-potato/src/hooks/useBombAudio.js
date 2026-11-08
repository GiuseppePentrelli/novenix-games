import { useCallback, useRef } from 'react'

// Tutto generato via Web Audio API: nessun file audio da hostare.
export function useBombAudio() {
  const ctxRef = useRef(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      ctxRef.current = new AudioContextClass()
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }, [])

  // Da chiamare al primo gesto utente (es. click su "Inizia") per sbloccare l'audio su iOS/Safari.
  const primeAudio = useCallback(() => {
    getCtx()
  }, [getCtx])

  // urgency: 0 (calmo) -> 1 (quasi esploso). Alza pitch e volume del tick.
  const tick = useCallback((urgency = 0) => {
    const ctx = getCtx()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    const baseFreq = 700 + urgency * 500
    osc.frequency.setValueAtTime(baseFreq, now)

    const peakVol = 0.12 + urgency * 0.18
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(peakVol, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)

    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.1)
  }, [getCtx])

  const explode = useCallback(() => {
    const ctx = getCtx()
    const now = ctx.currentTime

    // Rumore bianco per il "crash" dell'esplosione.
    const bufferSize = ctx.sampleRate * 0.6
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'lowpass'
    noiseFilter.frequency.setValueAtTime(3000, now)
    noiseFilter.frequency.exponentialRampToValueAtTime(200, now + 0.5)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.5, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination)

    // Boato grave sotto il rumore.
    const boom = ctx.createOscillator()
    const boomGain = ctx.createGain()
    boom.type = 'sine'
    boom.frequency.setValueAtTime(120, now)
    boom.frequency.exponentialRampToValueAtTime(30, now + 0.5)
    boomGain.gain.setValueAtTime(0.8, now)
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55)

    boom.connect(boomGain).connect(ctx.destination)

    noise.start(now)
    boom.start(now)
    noise.stop(now + 0.6)
    boom.stop(now + 0.6)
  }, [getCtx])

  return { primeAudio, tick, explode }
}
