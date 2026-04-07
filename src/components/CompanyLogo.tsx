"use client"

import { useState, useRef, useEffect } from "react"

export default function CompanyLogo({ domain, name }: { domain: string; name: string }) {
  const [failed, setFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Cas où l'image a échoué avant que React n'hydrate le composant
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth === 0) setFailed(true)
  }, [])

  if (failed) {
    return (
      <div style={{
        width: 36, height: 36,
        borderRadius: 10,
        background: "rgba(124,58,237,.2)",
        border: "1px solid rgba(124,58,237,.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-syne),Syne,sans-serif",
        fontWeight: 800, fontSize: "1.1rem", color: "#a78bfa",
      }}>
        {name[0]?.toUpperCase()}
      </div>
    )
  }

  // Sans fallback_opts, l'API renvoie 404 pour les domaines sans favicon → onError → lettre
  return (
    <img
      ref={imgRef}
      src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&url=https://${domain}&size=128`}
      alt={name}
      onError={() => setFailed(true)}
      style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 8 }}
    />
  )
}
