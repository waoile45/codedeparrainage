"use client"

import { useState } from "react"

export default function CompanyLogo({ domain, name }: { domain: string; name: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div style={{
        width: 36, height: 36,
        borderRadius: 10,
        background: "rgba(124,58,237,.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-syne),Syne,sans-serif",
        fontWeight: 800, fontSize: "1.1rem", color: "#a78bfa",
      }}>
        {name[0]?.toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt={name}
      onError={() => setFailed(true)}
      style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 8 }}
    />
  )
}
