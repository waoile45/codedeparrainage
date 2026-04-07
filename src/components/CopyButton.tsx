"use client"

import { useState } from "react"

export default function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try { await navigator.clipboard.writeText(code) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "0.45rem 1rem",
        background: copied ? "rgba(34,197,94,.15)" : "rgba(124,58,237,.15)",
        border: `1px solid ${copied ? "rgba(34,197,94,.35)" : "rgba(124,58,237,.35)"}`,
        borderRadius: 10,
        color: copied ? "#4ade80" : "#a78bfa",
        fontSize: ".82rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all .2s",
        fontFamily: "var(--font-dm-sans),'DM Sans',sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          Copié !
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copier
        </>
      )}
    </button>
  )
}
