import Navbar from '@/components/Navbar'
import { BanqueEntry, BanqueCasKey, BANQUE_CAS, BANQUE_CAS_KEYS } from '@/data/comparatifs/banque'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RANK_COLORS: Record<number, { bg: string; color: string; label: string }> = {
  1: { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: '#1' },
  2: { bg: 'rgba(148,163,184,0.12)', color: '#94A3B8', label: '#2' },
  3: { bg: 'rgba(180,120,80,0.12)', color: '#CD7C4A', label: '#3' },
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: '.75rem', color: 'var(--text-muted)', minWidth: 110 }}>{label}</span>
      <div style={{ flex: 1, background: 'var(--border-lg)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
        <div style={{ width: `${(value / 10) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: 4 }} />
      </div>
      <span style={{ fontSize: '.75rem', fontWeight: 700, color: '#a78bfa', minWidth: 28, textAlign: 'right' }}>
        {value.toFixed(1)}
      </span>
    </div>
  )
}

function StatChip({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div style={{ background: 'var(--bg-card-md)', border: '1px solid var(--border)', borderRadius: 10, padding: '.5rem .75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 80, flex: 1 }}>
      <span style={{ fontSize: '1rem' }}>{icon}</span>
      <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-strong)', textAlign: 'center' }}>{value}</span>
      <span style={{ fontSize: '.68rem', color: 'var(--text-faint)', textAlign: 'center' }}>{label}</span>
    </div>
  )
}

function BanqueCard({ banque, rank }: { banque: BanqueEntry; rank: number }) {
  const rankStyle = RANK_COLORS[rank] ?? { bg: 'rgba(255,255,255,0.04)', color: 'var(--text-faint)', label: `#${rank}` }

  return (
    <article style={{ background: 'var(--bg-card)', border: rank === 1 ? '1px solid rgba(124,58,237,.35)' : '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
      {/* ── Header ── */}
      <div style={{ padding: '1.375rem 1.5rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 200 }}>
            <div style={{ background: rankStyle.bg, color: rankStyle.color, borderRadius: 10, fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: '1rem', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {rankStyle.label}
            </div>
            <img src={`https://www.google.com/s2/favicons?sz=64&domain=${banque.domain}`} alt={banque.name} width={36} height={36} style={{ borderRadius: 8, flexShrink: 0 }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-strong)' }}>
                  {banque.name}
                </span>
                {banque.badge && (
                  <span style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#a78bfa', background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', borderRadius: 100, padding: '2px 8px' }}>
                    {banque.badge}
                  </span>
                )}
                <span style={{ fontSize: '.65rem', color: 'var(--text-faint)', background: 'var(--bg-card-md)', border: '1px solid var(--border)', borderRadius: 100, padding: '2px 8px' }}>
                  {banque.type}
                </span>
              </div>
              <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>{banque.tagline}</p>
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', borderRadius: 14, padding: '.75rem 1.25rem', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: '1.75rem', color: '#fff', lineHeight: 1 }}>
              {banque.score.toFixed(1)}
            </div>
            <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.6)', marginTop: 2 }}>/10</div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        {/* Stats chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <StatChip icon="💶" value={banque.fraisMensuels} label="frais/mois" />
          <StatChip icon="🌍" value={`${banque.paysDisponibles}+`} label="pays" />
          <StatChip icon="🎁" value={banque.bonusBienvenue} label="bonus" />
          <StatChip icon="🛡️" value={banque.garantieDepots} label="garantie dépôts" />
        </div>

        <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 1.25rem' }}>
          {banque.description}
        </p>

        {/* Score bars */}
        <div style={{ background: 'var(--bg-card-md)', border: '1px solid var(--border)', borderRadius: 12, padding: '.875rem 1rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ScoreBar label="Frais & transparence" value={banque.scores.frais} />
          <ScoreBar label="International" value={banque.scores.international} />
          <ScoreBar label="Fonctionnalités" value={banque.scores.fonctionnalites} />
          <ScoreBar label="Service client" value={banque.scores.support} />
          <ScoreBar label="Bonus & parrainage" value={banque.scores.bonus} />
        </div>

        {/* Pros / Cons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.15)', borderRadius: 12, padding: '.875rem 1rem' }}>
            <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#10b981', marginBottom: '.625rem' }}>Avantages</div>
            {banque.pros.map((pro, i) => (
              <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ color: '#10b981', fontSize: '.85rem', flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{pro}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(244,63,94,.05)', border: '1px solid rgba(244,63,94,.15)', borderRadius: 12, padding: '.875rem 1rem' }}>
            <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#f43f5e', marginBottom: '.625rem' }}>Inconvénients</div>
            {banque.cons.map((con, i) => (
              <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 6 }}>
                <span style={{ color: '#f43f5e', fontSize: '.85rem', flexShrink: 0, marginTop: 1 }}>✗</span>
                <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{con}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: '.75rem', color: 'var(--text-faint)', marginBottom: 2 }}>Frais mensuels</div>
            <div style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-strong)' }}>
              {banque.fraisMensuels}
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-faint)' }}>Bonus bienvenue : {banque.bonusBienvenue}</div>
          </div>
          <a href={banque.affiliateUrl} target="_blank" rel="nofollow sponsored noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '.875rem', padding: '.65rem 1.25rem', borderRadius: 12, textDecoration: 'none' }}>
            Ouvrir un compte {banque.name}
            <span style={{ fontSize: '.8rem' }}>↗</span>
          </a>
        </div>
      </div>
    </article>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: "Quelle est la différence entre une néobanque et une banque en ligne ?",
    a: "Une banque en ligne (Boursobank, Fortuneo) est une vraie banque agréée qui propose tous les services bancaires classiques : crédit immobilier, livret A, PEA, assurance vie. Une néobanque (Revolut, N26, Wise) est généralement un établissement de paiement ou de monnaie électronique, avec moins de services mais une interface plus moderne et des frais souvent plus bas. Les dépôts sont couverts différemment selon le statut.",
  },
  {
    q: "Mon argent est-il en sécurité dans une néobanque ?",
    a: "Cela dépend du statut réglementaire. Les banques (Boursobank, Fortuneo, N26) sont couvertes par la garantie des dépôts jusqu'à 100 000€ par établissement (FGDR en France). Revolut et Wise sont des établissements de monnaie électronique — vos fonds sont ségrégués dans des comptes dédiés, mais la protection est différente d'une banque traditionnelle. Wise et Revolut ont toutefois des licences bancaires dans certains pays européens.",
  },
  {
    q: "Peut-on avoir plusieurs banques en même temps ?",
    a: "Oui, et c'est même conseillé. La stratégie classique : une banque principale française (Boursobank) pour le virement de salaire, les prélèvements et l'épargne, et une néobanque (Revolut ou Wise) pour les voyages et les paiements en devises. Cette combinaison permet de profiter des avantages de chaque service sans leurs inconvénients.",
  },
  {
    q: "Quelle banque choisir pour recevoir son salaire ?",
    a: "Pour domicilier son salaire, une banque en ligne française comme Boursobank ou Fortuneo est recommandée — elles sont reconnues par tous les employeurs, offrent un vrai RIB français et proposent des services complets (épargne, crédit). Boursobank est souvent gratuite sous condition d'utilisation régulière, ce qui en fait un excellent choix principal.",
  },
  {
    q: "Y a-t-il des frais cachés dans les banques gratuites ?",
    a: "Les frais varient selon l'usage. Les frais courants à surveiller : commissions sur les paiements en devises étrangères (souvent 0,5 à 1,5%), frais de retrait au-delà d'un certain plafond mensuel, frais de tenue de compte si les conditions ne sont pas remplies. Wise et Revolut affichent leurs frais de façon transparente avant chaque transaction — ce qui les rend plus prévisibles que certaines banques traditionnelles.",
  },
  {
    q: "Comment fonctionne le bonus de parrainage bancaire ?",
    a: "Les banques comme Boursobank offrent un bonus à la fois au parrain et au filleul lors de l'ouverture d'un compte. Pour en bénéficier, vous devez utiliser un code ou lien de parrainage lors de votre inscription, puis remplir les conditions requises (premier virement, utilisation de la carte...). Le bonus est ensuite crédité sous quelques semaines. Les montants varient de 50€ à 240€ selon les offres en cours.",
  },
]

// ─── Composant principal ──────────────────────────────────────────────────────

type Props = {
  banques: BanqueEntry[]
  h1: string
  intro: string
  currentCas?: BanqueCasKey
  canonicalPath: string
}

const OTHER_CASES = BANQUE_CAS_KEYS.map((key) => ({ key, label: BANQUE_CAS[key].label }))

export default function BanqueComparatif({ banques, h1, intro, currentCas, canonicalPath }: Props) {
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

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "var(--font-dm-sans),'DM Sans',sans-serif", color: 'var(--text-strong)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <Navbar />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 6rem' }}>

        {/* ── Hero ── */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#a78bfa', background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', borderRadius: 100, padding: '3px 10px' }}>
              Comparatif Banques
            </span>
            <span style={{ fontSize: '.75rem', color: 'var(--text-faint)' }}>
              Mis à jour le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          <h1 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: 'clamp(1.6rem,4vw,2.4rem)', lineHeight: 1.1, letterSpacing: '-0.025em', margin: '0 0 1rem' }}>
            {h1}
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: 680, margin: '0 0 1.5rem' }}>
            {intro}
          </p>

          {/* Liens cas d'usage */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <a href="/meilleure-banque" style={{ fontSize: '.78rem', fontWeight: 600, padding: '.35rem .875rem', borderRadius: 8, textDecoration: 'none', background: !currentCas ? '#7c3aed' : 'var(--bg-card-md)', color: !currentCas ? '#fff' : 'var(--text-dim)', border: !currentCas ? 'none' : '1px solid var(--border)' }}>
              Général
            </a>
            {OTHER_CASES.map(({ key, label }) => (
              <a key={key} href={`/meilleure-banque/${key}`} style={{ fontSize: '.78rem', fontWeight: 600, padding: '.35rem .875rem', borderRadius: 8, textDecoration: 'none', background: currentCas === key ? '#7c3aed' : 'var(--bg-card-md)', color: currentCas === key ? '#fff' : 'var(--text-dim)', border: currentCas === key ? 'none' : '1px solid var(--border)' }}>
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* ── Top 3 ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '1rem 1.25rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-faint)', fontFamily: "var(--font-syne),Syne,sans-serif", marginBottom: '.75rem' }}>
            Notre top 3 en un coup d'œil
          </div>
          {banques.slice(0, 3).map((b, i) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '.625rem 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: '.9rem', color: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : '#CD7C4A', minWidth: 24 }}>#{i + 1}</span>
              <img src={`https://www.google.com/s2/favicons?sz=32&domain=${b.domain}`} alt={b.name} width={20} height={20} style={{ borderRadius: 4 }} />
              <span style={{ fontWeight: 600, fontSize: '.875rem', flex: 1 }}>{b.name}</span>
              <span style={{ fontSize: '.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{b.tagline}</span>
              <span style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: '.875rem', color: '#a78bfa', minWidth: 36, textAlign: 'right' }}>{b.score.toFixed(1)}</span>
            </div>
          ))}
        </div>

        {/* ── Classement ── */}
        <h2 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: '1.1rem', margin: '0 0 1rem' }}>
          Classement détaillé {year}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {banques.map((b, i) => <BanqueCard key={b.id} banque={b} rank={i + 1} />)}
        </div>

        {/* ── Méthode ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: '1rem', margin: '0 0 .875rem' }}>
            Notre méthode d'évaluation
          </h2>
          <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: '0 0 .875rem' }}>
            Chaque banque a été évaluée sur la base d'une utilisation réelle pendant plusieurs semaines. Nous testons les paiements en France et à l'étranger, les virements entrants et sortants, la réactivité du support client et la clarté des frais appliqués.
          </p>
          <p style={{ fontSize: '.875rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
            Les notes de bonus tiennent compte des offres de parrainage effectives au moment de la mise à jour. Ces offres varient régulièrement — vérifiez toujours les conditions en vigueur sur le site de la banque.
          </p>
        </div>

        {/* ── FAQ ── */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 700, fontSize: '1rem', margin: '0 0 .875rem' }}>
            Questions fréquentes sur les banques en ligne
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {FAQ.map((item, i) => (
              <details key={i} style={{ borderBottom: i < FAQ.length - 1 ? '1px solid var(--border)' : 'none', padding: '.75rem 0' }}>
                <summary style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--text-strong)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  {item.q}
                  <span style={{ color: 'var(--text-faint)', fontSize: '.75rem', flexShrink: 0 }} className="faq-arrow">▼</span>
                </summary>
                <p style={{ fontSize: '.85rem', color: 'var(--text-muted)', margin: '.625rem 0 0', lineHeight: 1.65 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div style={{ background: 'rgba(124,58,237,.05)', border: '1px solid rgba(124,58,237,.15)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>ℹ️</span>
          <p style={{ fontSize: '.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--text-dim)' }}>Transparence :</strong> Certains liens de cette page sont des liens d'affiliation. Si vous ouvrez un compte via nos liens, nous percevons une commission sans surcoût pour vous. Cela ne change pas nos recommandations.
          </p>
        </div>

        {/* ── Maillage interne ── */}
        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '.875rem', fontFamily: "var(--font-syne),Syne,sans-serif" }}>
            Autres comparatifs
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {OTHER_CASES.filter((c) => c.key !== currentCas).map(({ key, label }) => (
              <a key={key} href={`/meilleure-banque/${key}`} style={{ fontSize: '.8rem', padding: '.4rem .875rem', borderRadius: 10, background: 'var(--bg-card-md)', border: '1px solid var(--border)', color: 'var(--text-dim)', textDecoration: 'none' }}>
                Meilleure banque pour {label}
              </a>
            ))}
            <a href="/meilleur-vpn" style={{ fontSize: '.8rem', padding: '.4rem .875rem', borderRadius: 10, background: 'var(--bg-card-md)', border: '1px solid var(--border)', color: 'var(--text-dim)', textDecoration: 'none' }}>
              Comparatif VPN →
            </a>
            <a href="/codes" style={{ fontSize: '.8rem', padding: '.4rem .875rem', borderRadius: 10, background: 'var(--bg-card-md)', border: '1px solid var(--border)', color: 'var(--text-dim)', textDecoration: 'none' }}>
              Codes de parrainage →
            </a>
          </div>
        </div>
      </div>

      <style>{`
        details summary::-webkit-details-marker { display: none; }
        details[open] .faq-arrow { transform: rotate(180deg); }
        @media (max-width: 600px) { h1 { font-size: 1.5rem !important; } }
        @media (max-width: 520px) { [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
