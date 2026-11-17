"use client"

import { useEffect, useRef, useState } from "react"

export default function CompanyLogo({ domain, name }: { domain: string; name: string }) {
  const [failed, setFailed] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  // Si l'image a déjà échoué avant l'hydratation, onError ne sera jamais déclenché :
  // on relit l'état de l'élément une fois monté.
  useEffect(() => {
    const img = ref.current
    if (img && img.complete && img.naturalWidth <= 1) setFailed(true)
  }, [])

  if (failed) {
    return (
      <div style={{
        width: 36, height: 36,
        borderRadius: 10,
        background: "rgba(255,212,59,.2)",
        border: "1px solid rgba(255,212,59,.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 800, fontSize: "1.1rem", color: "var(--accent-text)",
      }}>
        {name[0]?.toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
      alt=""
      ref={ref}
      width={36}
      height={36}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      onLoad={(e) => {
        if ((e.currentTarget as HTMLImageElement).naturalWidth <= 1) setFailed(true)
      }}
      style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 8 }}
    />
  )
}
