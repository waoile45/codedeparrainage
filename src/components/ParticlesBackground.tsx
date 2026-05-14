"use client";

import { useEffect, useState } from "react";

const PARTICLES = [
  { id: 0,  left: "3%",   size: 4, delay: "0s",    dur: "12s", opacity: 0.25 },
  { id: 1,  left: "8%",   size: 3, delay: "1.5s",  dur: "10s", opacity: 0.18 },
  { id: 2,  left: "15%",  size: 5, delay: "3s",    dur: "14s", opacity: 0.22 },
  { id: 3,  left: "22%",  size: 3, delay: "0.8s",  dur: "11s", opacity: 0.16 },
  { id: 4,  left: "30%",  size: 4, delay: "2.2s",  dur: "13s", opacity: 0.14 },
  { id: 5,  left: "38%",  size: 3, delay: "4s",    dur: "9s",  opacity: 0.24 },
  { id: 6,  left: "45%",  size: 5, delay: "1s",    dur: "15s", opacity: 0.18 },
  { id: 7,  left: "52%",  size: 3, delay: "3.5s",  dur: "10s", opacity: 0.20 },
  { id: 8,  left: "60%",  size: 4, delay: "0.5s",  dur: "12s", opacity: 0.18 },
  { id: 9,  left: "67%",  size: 3, delay: "2.8s",  dur: "11s", opacity: 0.14 },
  { id: 10, left: "74%",  size: 5, delay: "1.8s",  dur: "13s", opacity: 0.24 },
  { id: 11, left: "81%",  size: 3, delay: "4.5s",  dur: "9s",  opacity: 0.18 },
  { id: 12, left: "88%",  size: 4, delay: "0.3s",  dur: "14s", opacity: 0.20 },
  { id: 13, left: "93%",  size: 3, delay: "3.2s",  dur: "10s", opacity: 0.18 },
  { id: 14, left: "12%",  size: 4, delay: "6s",    dur: "11s", opacity: 0.14 },
  { id: 15, left: "27%",  size: 3, delay: "5s",    dur: "12s", opacity: 0.22 },
  { id: 16, left: "55%",  size: 5, delay: "7s",    dur: "10s", opacity: 0.16 },
  { id: 17, left: "70%",  size: 3, delay: "5.5s",  dur: "13s", opacity: 0.20 },
  { id: 18, left: "85%",  size: 4, delay: "2s",    dur: "15s", opacity: 0.18 },
  { id: 19, left: "42%",  size: 3, delay: "6.5s",  dur: "9s",  opacity: 0.22 },
];

export default function ParticlesBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {PARTICLES.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.left,
            top: "-20px",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "#7c3aed",
            opacity: p.opacity,
            animation: `particleFall ${p.dur} linear ${p.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}
