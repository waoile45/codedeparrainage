"use client"

import { useState } from "react"

// variant « ink » : bouton encre, posé sur le ticket jaune.
// variant « line » : bouton cerclé, dans les listes sur fond sombre.
export default function CopyButton({ code, variant = "line" }: { code: string; variant?: "ink" | "line" }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try { await navigator.clipboard.writeText(code) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button type="button" onClick={handleCopy} className={`copy-btn copy-${variant}${copied ? " is-copied" : ""}`} aria-live="polite">
      {copied ? (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
          Copié
        </>
      ) : (
        <>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copier
        </>
      )}
      <style>{`
        .copy-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px; flex-shrink: 0;
          min-height: 44px; padding: 0 1.05rem; border-radius: 10px; cursor: pointer;
          font-family: var(--font-text), sans-serif; font-size: .95rem; font-weight: 700; white-space: nowrap;
          transition: background-color .15s ease, color .15s ease, box-shadow .15s ease;
        }
        .copy-ink { background: var(--ink); color: var(--paper); border: 0; }
        .copy-ink:hover { background: #000; }
        .copy-line { background: transparent; color: var(--text-strong); border: 0; box-shadow: inset 0 0 0 1.5px var(--border-lg); }
        .copy-line:hover { box-shadow: inset 0 0 0 1.5px var(--accent); }
        .copy-btn.is-copied { background: var(--ok); color: #0B2016; box-shadow: none; animation: copy-pop .35s cubic-bezier(.3,1.6,.5,1); }
        @keyframes copy-pop { 0% { transform: scale(.9); } 100% { transform: scale(1); } }
      `}</style>
    </button>
  )
}
