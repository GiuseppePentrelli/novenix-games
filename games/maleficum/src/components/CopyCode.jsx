import { useState } from 'react'

// Copia il codice stanza negli appunti, con feedback visivo.
export default function CopyCode({ code, className = '', compact = false }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // Fallback per browser/contesti senza Clipboard API
      const ta = document.createElement('textarea')
      ta.value = code
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
      } catch {
        /* niente da fare */
      }
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      onClick={copy}
      title="Copia il codice"
      className={`sigil-btn venom ${compact ? '!px-3 !py-1 text-xs' : ''} ${className}`}
    >
      {copied ? '✓ Copiato' : `⧉ Copia${compact ? '' : ' codice'}`}
    </button>
  )
}
