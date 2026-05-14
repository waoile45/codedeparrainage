import Navbar from '@/components/Navbar'
import { VpnEntry, UseCaseKey, USE_CASES, USE_CASE_KEYS } from '@/data/comparatifs/vpn'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RANK_COLORS: Record<number, { bg: string; color: string; label: string }> = {
  1: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: '#1' },
  2: { bg: 'rgba(148,163,184,0.12)', color: '#94A3B8', label: '#2' },
  3: { bg: 'rgba(180,120,80,0.12)', color: '#CD7C4A', label: '#3' },
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', minWidth: 90 }}>{label}</span>
      <div style={{ flex: 1, background: 'var(--border-lg)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
        <div
          style={{
            width: `${(value / 10) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
            borderRadius: 4,
          }}
        />
      </div>
      <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#a78bfa', minWidth: 28, textAlign: 'right' }}>
        {value.toFixed(1)}
      </span>
    </div>
  )
}

function StatChip({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div
      style={{
        background: 'var(--bg-card-md)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '.5rem .75rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        minWidth: 80,
        flex: 1,
      }}
    >
      <span style={{ fontSize: '1rem' }}>{icon}</span>
      <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text-strong)' }}>{value}</span>
      <span style={{ fontSize: '.68rem', color: 'var(--text-faint)', textAlign: 'center' }}>{label}</span>
    </div>
  )
}

function VpnCard({ vpn, rank }: { vpn: VpnEntry; rank: number }) {
  const rankStyle = RANK_COLORS[rank] ?? { bg: 'rgba(255,255,255,0.04)', color: 'var(--text-faint)', label: `#${rank}` }

  return (
    <article
      style={{
        background: 'var(--bg-card)',
        border: rank === 1 ? '1px solid rgba(124,58,237,.35)' : '1px solid var(--border)',
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      {/* ── Header ── */}
      <div style={{ padding: '1.375rem 1.5rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>

          {/* Left: rank + logo + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 200 }}>
            <div
              style={{
                background: rankStyle.bg,
                color: rankStyle.color,
                borderRadius: 10,
                fontFamily: "var(--font-syne),Syne,sans-serif",
                fontWeight: 800,
                fontSize: '1rem',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {rankStyle.label}
            </div>

            <img
              src={`https://www.google.com/s2/favicons?sz=64&domain=${vpn.domain}`}
              alt={vpn.name}
              width={36}
              height={36}
              style={{ borderRadius: 8, flexShrink: 0 }}
            />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: "var(--font-syne),Syne,sans-serif",
                    fontWeight: 800,
                    fontSize: '1.15rem',
                    color: 'var(--text-strong)',
                  }}
                >
                  {vpn.name}
                </span>
                {vpn.badge && (
                  <span
                    style={{
                      fontSize: '.65rem',
                      fontWeight: 700,
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                      color: '#a78bfa',
                      background: 'rgba(124,58,237,.12)',
                      border: '1px solid rgba(124,58,237,.25)',
                      borderRadius: 100,
                      padding: '2px 8px',
                    }}
                  >
                    {vpn.badge}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>{vpn.tagline}</p>
            </div>
          </div>

          {/* Right: score */}
          <div
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              borderRadius: 14,
              padding: '.75rem 1.25rem',
              textAlign: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-syne),Syne,sans-serif",
                fontWeight: 800,
                fontSize: '1.75rem',
                color: '#fff',
                lineHeight: 1,
              }}
            >
              {vpn.score.toFixed(1)}
            </div>
            <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.6)', marginTop: 2 }}>/10</div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '1.25rem 1.5rem' }}>

        {/* Stats chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <StatChip icon="🌐" value={`${vpn.servers.toLocaleString('fr-FR')}+`} label="serveurs" />
          <StatChip icon="🗺️" value={`${vpn.countries}`} label="pays" />
          <StatChip
            icon="📱"
            value={typeof vpn.connections === 'number' ? String(vpn.connections) : '∞'}
            label="appareils"
          />
          <StatChip icon="🔄" value={`${vpn.guarantee} j`} label="remboursement" />
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: '.875rem',
            color: 'var(--text-muted)',
            lineHeight: 1.65,
            margin: '0 0 1.25rem',
          }}
        >
          {vpn.description}
        </p>

        {/* Score bars */}
        <div
          style={{
            background: 'var(--bg-card-md)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '.875rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <ScoreBar label="Vitesse" value={vpn.scores.vitesse} />
          <ScoreBar label="Sécurité" value={vpn.scores.securite} />
          <ScoreBar label="Facilité d'usage" value={vpn.scores.facilite} />
          <ScoreBar label="Streaming" value={vpn.scores.streaming} />
          <ScoreBar label="Rapport qualité/prix" value={vpn.scores.prix} />
        </div>

        {/* Pros / Cons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1.25rem' }}>
          <div
            style={{
              background: 'rgba(16,185,129,.05)',
              border: '1px solid rgba(16,185,129,.15)',
              borderRadius: 12,
              padding: '.875rem 1rem',
            }}
          >
            <div
              style={{
                fontSize: '.7rem',
                fontWeight: 700,
                letterSpacing: '.07em',
                textTransform: 'uppercase',
                color: '#10b981',
                marginBottom: '.625rem',
              }}
            >
              Avantages
            </div>
            {vpn.pros.map((pro, i) => (
              <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ color: '#10b981', fontSize: '.85rem', flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{pro}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              background: 'rgba(244,63,94,.05)',
              border: '1px solid rgba(244,63,94,.15)',
              borderRadius: 12,
              padding: '.875rem 1rem',
            }}
          >
            <div
              style={{
                fontSize: '.7rem',
                fontWeight: 700,
                letterSpacing: '.07em',
                textTransform: 'uppercase',
                color: '#f43f5e',
                marginBottom: '.625rem',
              }}
            >
              Inconvénients
            </div>
            {vpn.cons.map((con, i) => (
              <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ color: '#f43f5e', fontSize: '.85rem', flexShrink: 0, marginTop: 1 }}>✗</span>
                <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{con}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing + CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border)',
          }}
        >
          <div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-faint)', marginBottom: 2 }}>Meilleure offre</div>
            <div style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-strong)' }}>
              {vpn.bestPrice.toFixed(2)}€
              <span style={{ fontWeight: 400, fontSize: '.8rem', color: 'var(--text-muted)' }}>/mois</span>
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-faint)' }}>Engagement {vpn.bestPriceDuration} · {vpn.monthlyPrice.toFixed(2)}€ sans engagement</div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a
              href={vpn.affiliateUrl}
              target="_blank"
              rel="nofollow sponsored noopener"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#7c3aed',
                color: '#fff',
                fontWeight: 700,
                fontSize: '.875rem',
                padding: '.65rem 1.25rem',
                borderRadius: 12,
                textDecoration: 'none',
              }}
            >
              Essayer {vpn.name}
              <span style={{ fontSize: '.8rem' }}>↗</span>
            </a>
          </div>
        </div>

        {/* Platforms */}
        <div style={{ marginTop: '0.875rem', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {vpn.platforms.map((p) => (
            <span
              key={p}
              style={{
                fontSize: '.67rem',
                color: 'var(--text-faint)',
                background: 'var(--bg-card-md)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '2px 8px',
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

type Props = {
  vpns: VpnEntry[]
  h1: string
  intro: string
  currentCas?: UseCaseKey
  canonicalPath: string
}

const FAQ = [
  {
    q: "Qu'est-ce qu'un VPN et à quoi ça sert concrètement ?",
    a: "Un VPN (Virtual Private Network) chiffre votre connexion internet et masque votre adresse IP réelle. Concrètement, cela sert à trois choses : protéger vos données sur les réseaux WiFi publics (hôtels, cafés), contourner les restrictions géographiques sur le streaming, et préserver votre vie privée vis-à-vis de votre fournisseur d'accès et des trackers publicitaires.",
  },
  {
    q: "Un VPN est-il légal en France ?",
    a: "Oui, l'utilisation d'un VPN est totalement légale en France pour les particuliers. Ce qui reste illégal, c'est l'usage que vous en faites — pirater du contenu protégé ou commettre des actes illicites avec ou sans VPN reste répréhensible. Le VPN en lui-même n'est qu'un outil de confidentialité.",
  },
  {
    q: "Un VPN ralentit-il vraiment la connexion internet ?",
    a: "Un VPN de qualité ralentit la connexion de 5 à 15% maximum — imperceptible en pratique pour le streaming HD ou la navigation. Les ralentissements importants (50%+) sont le signe d'un service de mauvaise qualité ou d'un serveur surchargé. NordVPN et ExpressVPN maintiennent des vitesses supérieures à 400 Mb/s dans nos tests.",
  },
  {
    q: "Quelle est la différence entre un VPN gratuit et payant ?",
    a: "Les VPN gratuits financent leur service en revendant vos données de navigation — exactement l'inverse de leur promesse de confidentialité. Les exceptions notables sont ProtonVPN (version gratuite sans revente de données) et Windscribe (10 Go/mois). Pour un usage régulier et un accès au streaming, un VPN payant à 2-4€/mois reste la seule option viable.",
  },
  {
    q: "Peut-on utiliser un VPN sur tous ses appareils ?",
    a: "Oui. La plupart des VPN proposent des applications pour Windows, Mac, Linux, Android et iOS. Surfshark se distingue en autorisant des appareils simultanés illimités. NordVPN et ProtonVPN permettent 10 connexions simultanées. Pour les Smart TV et consoles, des solutions comme MediaStreamer d'ExpressVPN fonctionnent via configuration DNS.",
  },
  {
    q: "Qu'est-ce que la politique no-log et pourquoi est-ce important ?",
    a: "Une politique no-log signifie que le fournisseur ne conserve aucun journal de votre activité en ligne. Si un gouvernement ou des hackers compromettent les serveurs, il n'y a rien à récupérer. Les meilleures offres (NordVPN, ProtonVPN, ExpressVPN) ont fait auditer cette politique par des cabinets indépendants — PwC pour NordVPN, confirmant l'absence de logs.",
  },
]

const OTHER_CASES = USE_CASE_KEYS.map((key) => ({ key, label: USE_CASES[key].label }))

export default function VpnComparatif({ vpns, h1, intro, currentCas, canonicalPath }: Props) {
  const year = new Date().getFullYear()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: h1,
    dateModified: new Date().toISOString().split('T')[0],
    author: { '@type': 'Organization', name: 'codedeparrainage.com' },
    publisher: { '@type': 'Organization', name: 'codedeparrainage.com', url: 'https://www.codedeparrainage.com' },
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: h1,
    numberOfItems: vpns.length,
    itemListElement: vpns.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: v.name,
      url: `https://${v.domain}`,
    })),
  }

  return (
    <div
      style={{
        background: 'var(--bg)',
        minHeight: '100vh',
        fontFamily: "var(--font-dm-sans),'DM Sans',sans-serif",
        color: 'var(--text-strong)',
      }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />

      <Navbar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '.7rem',
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: '#a78bfa',
                background: 'rgba(124,58,237,.12)',
                border: '1px solid rgba(124,58,237,.25)',
                borderRadius: 100,
                padding: '3px 10px',
              }}
            >
              Comparatif VPN
            </span>
            <span style={{ fontSize: '.75rem', color: 'var(--text-faint)' }}>
              Mis à jour le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-syne),Syne,sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(1.6rem,4vw,2.4rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              margin: '0 0 1rem',
            }}
          >
            {h1}
          </h1>

          <p
            style={{
              fontSize: '1rem',
              color: 'var(--text-muted)',
              lineHeight: 1.65,
              maxWidth: 680,
              margin: '0 0 1.5rem',
            }}
          >
            {intro}
          </p>

          {/* Liens vers autres cas d'usage */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a
              href="/meilleur-vpn"
              style={{
                fontSize: '.78rem',
                fontWeight: 600,
                padding: '.35rem .875rem',
                borderRadius: 8,
                textDecoration: 'none',
                background: !currentCas ? '#7c3aed' : 'var(--bg-card-md)',
                color: !currentCas ? '#fff' : 'var(--text-dim)',
                border: !currentCas ? 'none' : '1px solid var(--border)',
              }}
            >
              Général
            </a>
            {OTHER_CASES.map(({ key, label }) => (
              <a
                key={key}
                href={`/meilleur-vpn/${key}`}
                style={{
                  fontSize: '.78rem',
                  fontWeight: 600,
                  padding: '.35rem .875rem',
                  borderRadius: 8,
                  textDecoration: 'none',
                  background: currentCas === key ? '#7c3aed' : 'var(--bg-card-md)',
                  color: currentCas === key ? '#fff' : 'var(--text-dim)',
                  border: currentCas === key ? 'none' : '1px solid var(--border)',
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* ── Top 3 résumé rapide ── */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              fontSize: '.7rem',
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
              fontFamily: "var(--font-syne),Syne,sans-serif",
              marginBottom: '.75rem',
            }}
          >
            Notre top 3 en un coup d'œil
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {vpns.slice(0, 3).map((vpn, i) => (
              <div
                key={vpn.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '.625rem 0',
                  borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-syne),Syne,sans-serif",
                    fontWeight: 800,
                    fontSize: '.9rem',
                    color: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : '#CD7C4A',
                    minWidth: 24,
                  }}
                >
                  #{i + 1}
                </span>
                <img
                  src={`https://www.google.com/s2/favicons?sz=32&domain=${vpn.domain}`}
                  alt={vpn.name}
                  width={20}
                  height={20}
                  style={{ borderRadius: 4 }}
                />
                <span style={{ fontWeight: 600, fontSize: '.875rem', flex: 1 }}>{vpn.name}</span>
                <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{vpn.tagline}</span>
                <span
                  style={{
                    fontFamily: "var(--font-syne),Syne,sans-serif",
                    fontWeight: 800,
                    fontSize: '.875rem',
                    color: '#a78bfa',
                    minWidth: 36,
                    textAlign: 'right',
                  }}
                >
                  {vpn.score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Classement détaillé ── */}
        <h2
          style={{
            fontFamily: "var(--font-syne),Syne,sans-serif",
            fontWeight: 700,
            fontSize: '1.1rem',
            margin: '0 0 1rem',
          }}
        >
          Classement détaillé {year}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {vpns.map((vpn, i) => (
            <VpnCard key={vpn.id} vpn={vpn} rank={i + 1} />
          ))}
        </div>

        {/* ── Pourquoi utiliser un VPN ── */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-syne),Syne,sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              margin: '0 0 .875rem',
            }}
          >
            Notre méthode de test
          </h2>
          <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 .875rem' }}>
            Chaque VPN de ce comparatif a été testé pendant un minimum de 30 jours sur Windows, Android et iOS. Nous mesurons les vitesses avec Speedtest.net depuis plusieurs localisations (Paris, Londres, New York), testons manuellement la compatibilité avec Netflix US/UK, Disney+ et Prime Video, et vérifions l'efficacité du kill switch en simulant des coupures réseau.
          </p>
          <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
            Les notes reflètent notre expérience réelle, pas les arguments marketing. Les inconvénients listés sont ceux que nous avons effectivement rencontrés. Nous mettons ce classement à jour à chaque changement tarifaire ou mise à jour majeure.
          </p>
        </div>

        {/* ── FAQ ── */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-syne),Syne,sans-serif",
              fontWeight: 700,
              fontSize: '1rem',
              margin: '0 0 .875rem',
            }}
          >
            Questions fréquentes sur les VPN
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {FAQ.map((item, i) => (
              <details
                key={i}
                style={{ borderBottom: i < FAQ.length - 1 ? '1px solid var(--border)' : 'none', padding: '.75rem 0' }}
              >
                <summary
                  style={{
                    fontSize: '.875rem',
                    fontWeight: 600,
                    color: 'var(--text-strong)',
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {item.q}
                  <span style={{ color: 'var(--text-faint)', fontSize: '.75rem', flexShrink: 0, transition: 'transform .2s' }} className="faq-arrow">▼</span>
                </summary>
                <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', margin: '.625rem 0 0', lineHeight: 1.65 }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* ── Disclaimer affilié ── */}
        <div
          style={{
            background: 'rgba(124,58,237,.05)',
            border: '1px solid rgba(124,58,237,.15)',
            borderRadius: 12,
            padding: '1rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>ℹ️</span>
          <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--text-dim)' }}>Transparence :</strong> Certains liens de cette page sont des liens d'affiliation. Si vous souscrivez via nos liens, nous percevons une commission sans surcoût pour vous. Cela ne change pas nos recommandations — nous ne listons que des services que nous avons testés et qui méritent leur place.
          </p>
        </div>

        {/* ── Maillage interne ── */}
        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div
            style={{
              fontSize: '.72rem',
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
              marginBottom: '.875rem',
              fontFamily: "var(--font-syne),Syne,sans-serif",
            }}
          >
            Autres comparatifs VPN
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {OTHER_CASES.filter((c) => c.key !== currentCas).map(({ key, label }) => (
              <a
                key={key}
                href={`/meilleur-vpn/${key}`}
                style={{
                  fontSize: '.8rem',
                  padding: '.4rem .875rem',
                  borderRadius: 10,
                  background: 'var(--bg-card-md)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-dim)',
                  textDecoration: 'none',
                }}
              >
                Meilleur VPN pour {label}
              </a>
            ))}
            <a
              href="/codes"
              style={{
                fontSize: '.8rem',
                padding: '.4rem .875rem',
                borderRadius: 10,
                background: 'var(--bg-card-md)',
                border: '1px solid var(--border)',
                color: 'var(--text-dim)',
                textDecoration: 'none',
              }}
            >
              Codes de parrainage →
            </a>
          </div>
        </div>
      </div>

      <style>{`
        details summary::-webkit-details-marker { display: none; }
        details[open] .faq-arrow { transform: rotate(180deg); }
        @media (max-width: 600px) {
          h1 { font-size: 1.5rem !important; }
        }
        @media (max-width: 520px) {
          [style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
