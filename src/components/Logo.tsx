// Logo : un ticket jaune (le code qu'on se passe) avec ses deux encoches et sa
// ligne de perforation, suivi du nom en Archivo élargie. « de » est posé sur
// une étiquette jaune, comme un prix en rayon. Le « + » du ticket : la prime.

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 40 29" aria-hidden="true" focusable="false">
      <path
        d="M4 0h32a4 4 0 0 1 4 4v6.5a4 4 0 0 0 0 8V25a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4v-6.5a4 4 0 0 0 0-8V4a4 4 0 0 1 4-4z"
        fill="var(--accent)"
      />
      <path d="M27 4v21" stroke="var(--accent-ink)" strokeWidth="2" strokeDasharray="2.4 2.6" strokeLinecap="round" />
      <path d="M13.5 9.2v10.6M8.2 14.5h10.6" stroke="var(--accent-ink)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ size = 30, compactBelow }: { size?: number; compactBelow?: number }) {
  return (
    <span className="cdp-logo" data-compact={compactBelow ? "" : undefined}>
      <LogoMark size={size} />
      <span className="cdp-logo-word">
        code<span className="cdp-logo-de">de</span>parrainage
      </span>
      <style>{`
        .cdp-logo { display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; }
        .cdp-logo-word {
          font-family: var(--font-display), sans-serif; font-weight: 800; font-stretch: 112%;
          font-size: 1.06rem; letter-spacing: -0.01em; color: var(--text-strong);
        }
        .cdp-logo-de {
          display: inline-block; background: var(--accent); color: var(--accent-ink);
          padding: 0 .22em; margin: 0 .08em; border-radius: 3px; line-height: 1.25;
        }
        @media (max-width: 380px) { .cdp-logo-word { font-size: .94rem; } }
      `}</style>
    </span>
  );
}
