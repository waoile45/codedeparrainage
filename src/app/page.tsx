import Link from 'next/link'
import Navbar from '@/components/Navbar'
import CodeJourney, { type JourneyData } from '@/components/home/CodeJourney'
import { createAnonSupabase } from '@/lib/supabase-server'
import { CATEGORIES } from '@/data/categories'
import './home.css'

export const revalidate = 1800 // 30 min : compteurs rafraîchis sans recharger à chaque visite

// Accueil, une idée par écran : la promesse et la démonstration qui joue seule,
// les marques où il y a le plus de codes, ce que gagne un parrain, les
// catégories, les questions, puis un dernier écran jaune. Tout est rendu côté
// serveur (texte et liens dans le HTML) ; seule la démonstration est un îlot client.

type CompanyRow = {
  name: string
  slug: string | null
  url_slug: string | null
  referral_bonus_description: string | null
}
type Row = { user_id: string | null; code: string | null; company_id: string | null; companies: CompanyRow | null }

type Brand = { name: string; urlSlug: string; domain: string; bonus: string | null; count: number }

// Marques retirées de la vitrine de l'accueil (elles restent dans l'annuaire).
// Vide depuis la correction du domaine de Taptap Send (taptapsend.com).
const HIDDEN_FROM_HOME = new Set<string>([])

const BETTING = new Set(CATEGORIES.find((c) => c.slug === 'paris-sportifs')?.brands ?? [])
const BANKING = new Set(CATEGORIES.find((c) => c.slug === 'banque')?.brands ?? [])

// Libellés courts des catégories, écrits pour l'accueil.
const CAT_LINES: Record<string, string> = {
  banque: 'Une prime en euros à l’ouverture, souvent après l’activation de la carte.',
  cashback: 'Quelques euros offerts à l’inscription, puis un pourcentage sur tes achats.',
  'paris-sportifs': 'Premier pari remboursé ou offert. Réservé aux plus de 18 ans.',
  crypto: 'Réduction sur les frais ou crypto offerte après un premier achat.',
  telephonie: 'Un mois offert ou une remise sur le forfait.',
  energie: 'Un bon d’achat ou une remise sur la première facture.',
  shopping: 'Une réduction sur la première commande.',
  mobilite: 'Des crédits sur les premiers trajets.',
}

function domainOf(slug: string | null) {
  const s = String(slug ?? '')
  return s.includes('.') ? s : `${s}.com`
}

function formatName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

const FALLBACK_JOURNEY: JourneyData = {
  brand: 'Fortuneo',
  slug: 'fortuneo',
  domain: 'fortuneo.fr',
  bonus: 'Prime de bienvenue à l’ouverture',
  code: 'CODE1234',
}

async function getHomeData() {
  const empty = { codesCount: 0, publishers: 0, brandsCount: 0, brands: [] as Brand[], journey: FALLBACK_JOURNEY, catCounts: {} as Record<string, number> }
  try {
    const supabase = createAnonSupabase()
    const { data, count } = await supabase
      .from('announcements')
      .select('user_id, code, company_id, companies(name, slug, url_slug, referral_bonus_description)', { count: 'exact' })
      .order('last_bumped_at', { ascending: false })
      .limit(1000)
    const rows = (data ?? []) as unknown as Row[]

    const publishers = new Set(rows.map((r) => r.user_id).filter(Boolean)).size
    const byBrand = new Map<string, Brand & { codes: string[] }>()
    for (const r of rows) {
      const c = r.companies
      if (!r.company_id || !c?.url_slug) continue
      const b = byBrand.get(r.company_id) ?? {
        name: formatName(c.name),
        urlSlug: c.url_slug,
        domain: domainOf(c.slug),
        bonus: c.referral_bonus_description,
        count: 0,
        codes: [],
      }
      b.count++
      if (r.code) b.codes.push(r.code.trim())
      byBrand.set(r.company_id, b)
    }
    const all = [...byBrand.values()].sort((a, b) => b.count - a.count)
    const activeSlugs = new Set(all.map((b) => b.urlSlug))

    // Démonstration : jamais un site de paris ; une banque avec une prime
    // renseignée et un code court de préférence, sinon la marque la plus active.
    const shortCode = (b: { codes: string[] }) => b.codes.find((c) => /^[A-Za-z0-9-]{4,16}$/.test(c))
    const candidates = all.filter((b) => b.bonus && !BETTING.has(b.urlSlug) && shortCode(b))
    const pick = candidates.find((b) => BANKING.has(b.urlSlug)) ?? candidates[0]
    const journey: JourneyData = pick
      ? { brand: pick.name, slug: pick.urlSlug, domain: pick.domain, bonus: pick.bonus!, code: shortCode(pick)! }
      : FALLBACK_JOURNEY

    const catCounts: Record<string, number> = {}
    for (const c of CATEGORIES) catCounts[c.slug] = c.brands.filter((s) => activeSlugs.has(s)).length

    return {
      codesCount: count ?? rows.length,
      publishers,
      brandsCount: all.length,
      brands: all.filter((b) => !HIDDEN_FROM_HOME.has(b.urlSlug)).slice(0, 8).map(({ codes: _codes, ...b }) => b),
      journey,
      catCounts,
    }
  } catch {
    return empty
  }
}

const FAQ = [
  {
    q: 'Qu’est-ce qu’un code de parrainage ?',
    a: 'C’est un code, ou un lien, que la marque remet à ses clients pour qu’ils invitent leurs proches. Quand quelqu’un s’inscrit avec, le nouveau client et le parrain reçoivent une contrepartie : prime en euros, mois offerts, réduction, pari remboursé. Les banques en ligne, les bookmakers, les plateformes crypto et les applis de cashback fonctionnent tous ainsi.',
  },
  {
    q: 'Comment utiliser un code de parrainage ?',
    a: 'Pendant la création du compte, le formulaire de la marque affiche un champ « code parrainage », « code promo » ou « code ami ». Colle le code à cet endroit, puis termine l’inscription. On peut rarement ajouter un code après coup : vérifie ce champ avant de valider.',
  },
  {
    q: 'Les codes publiés ici sont-ils vérifiés ?',
    a: 'Pas automatiquement. Chaque code est publié par un membre inscrit, avec son pseudo et sa date. Les plus récents ou remontés par leur parrain passent en tête de liste, et tu peux noter un parrain après avoir utilisé son code. En cas de doute, compare la prime affichée avec celle du site de la marque.',
  },
  {
    q: 'Combien rapporte un parrainage ?',
    a: 'Cela dépend de la marque et change souvent. Les banques en ligne versent en général une prime en euros, les bookmakers remboursent ou offrent un premier pari, les plateformes crypto réduisent les frais. Le montant est indiqué sur la page de la marque quand il est renseigné, et toujours à confirmer chez la marque avant de t’inscrire.',
  },
  {
    q: 'Comment publier mon propre code ?',
    a: 'Crée un compte, clique sur « Publier », choisis la marque et colle ton code. L’annonce apparaît tout de suite sur la page de la marque et dans l’annuaire. Tu peux la remonter en tête de liste jusqu’à 5 fois par jour.',
  },
  {
    q: 'Est-ce légal d’utiliser un code de parrainage ?',
    a: 'Oui : le parrainage est un programme officiel, prévu dans les conditions générales de la marque. Tu profites de l’offre qu’elle réserve aux clients recommandés. La règle habituelle : un seul code par nouveau compte.',
  },
]

export const metadata = {
  // absolute : sans le template « %s | codedeparrainage.com » qui dupliquait la marque
  title: { absolute: 'Code de parrainage 2026 : codes partagés par la communauté' },
  description:
    'Codes de parrainage publiés par des clients des marques : Fortuneo, Revolut, iGraal, Trade Republic… Copie le code, colle-le à l’inscription, touche la prime de bienvenue.',
  alternates: { canonical: 'https://www.codedeparrainage.com' },
  openGraph: {
    title: 'Code de parrainage 2026 : codes partagés par la communauté',
    description: 'Codes de parrainage publiés par des clients des marques. Banque, paris sportifs, crypto, cashback, télécom.',
    url: 'https://www.codedeparrainage.com',
    type: 'website',
    siteName: 'codedeparrainage.com',
    locale: 'fr_FR',
  },
}

const nf = new Intl.NumberFormat('fr-FR')

export default async function HomePage() {
  const d = await getHomeData()
  const showsBetting = d.brands.some((b) => BETTING.has(b.urlSlug))

  return (
    <>
      <Navbar activePage="home" />
      <main className="hp">
        {/* ── 1. La promesse, et la démonstration qui joue seule ───────────── */}
        <section className="hp-hero">
          <div className="wrap hp-hero-grid">
            <div className="hp-hero-text">
              <h1 className="display-wide">
                Ne t&apos;inscris plus sans <span className="mark-dark">code</span> <span className="mark-dark">parrainage</span>.
              </h1>
              <p className="hp-lede">
                Chez une banque en ligne, une appli de cashback ou un courtier, le code saisi à l&apos;inscription
                débloque la prime de bienvenue. Ici, <strong className="tnum">{nf.format(d.codesCount)}</strong> codes
                publiés par <strong className="tnum">{nf.format(d.publishers)}</strong> membres, pour{' '}
                <strong className="tnum">{nf.format(d.brandsCount)}</strong> marques.
              </p>

              <form className="hp-search" action="/codes" method="get" role="search">
                <label htmlFor="hp-q" className="hp-search-label">Quelle marque ?</label>
                <div className="hp-search-row">
                  <input id="hp-q" name="search" type="search" placeholder="Fortuneo, Revolut, iGraal…" autoComplete="off" />
                  <button type="submit" className="btn btn-accent">Chercher</button>
                </div>
              </form>

              {d.brands.length > 0 && (
                <p className="hp-popular">
                  <span>Les plus partagées :</span>
                  {d.brands.filter((b) => !BETTING.has(b.urlSlug)).slice(0, 5).map((b) => (
                    <Link key={b.urlSlug} href={`/code-parrainage/${b.urlSlug}`}>{b.name}</Link>
                  ))}
                </p>
              )}
            </div>

            <div className="hp-hero-demo">
              <CodeJourney data={d.journey} />
            </div>
          </div>
        </section>

        {/* ── 2. Les marques où il y a le plus de codes ────────────────────── */}
        <section className="band-paper hp-brands">
          <div className="wrap">
            <h2 className="reveal">Les marques où il y a le plus de codes</h2>
            <p className="hp-section-lede reveal" data-delay="1">
              Classées par nombre de codes publiés. La prime affichée est celle que la marque annonce ; vérifie ses
              conditions avant de t&apos;inscrire.
            </p>
            <ol className="hp-brand-list">
              {d.brands.map((b, i) => (
                <li key={b.urlSlug} className="reveal" data-delay={String(Math.min(i % 4, 3))}>
                  <Link href={`/code-parrainage/${b.urlSlug}`} className="hp-brand-row">
                    <img src={`https://www.google.com/s2/favicons?domain=${b.domain}&sz=64`} alt="" width={32} height={32} loading="lazy" decoding="async" />
                    <span className="hp-brand-name">{b.name}</span>
                    <span className="hp-brand-bonus">{b.bonus ?? 'Prime selon les conditions de la marque'}</span>
                    <span className="hp-brand-count tnum">{b.count} code{b.count > 1 ? 's' : ''}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <div className="hp-brands-foot reveal">
              <Link href="/codes" className="btn btn-ink">Voir les {nf.format(d.brandsCount)} marques</Link>
              {showsBetting && (
                <p className="hp-anj">
                  Paris sportifs : jouer comporte des risques (endettement, isolement, dépendance). Pour être aidé,
                  appelle le 09 74 75 13 13 (appel non surtaxé). Interdit aux moins de 18 ans.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── 3. Côté parrain ──────────────────────────────────────────────── */}
        <section className="hp-parrain">
          <div className="wrap hp-parrain-grid">
            <div>
              <h2 className="reveal">Déjà client quelque part ? Ton code peut servir à quelqu&apos;un.</h2>
              <p className="hp-section-lede reveal" data-delay="1">
                Ton code de parrainage est dans l&apos;appli de ta banque ou de ton appli de cashback. Publie-le ici :
                il apparaît sur la page de la marque, là où arrivent ceux qui le cherchent sur Google.
              </p>
              <dl className="hp-facts">
                <div className="reveal" data-delay="1">
                  <dt>Signé et daté</dt>
                  <dd>Ton annonce porte ton pseudo et sa date de publication. Ceux qui l&apos;utilisent peuvent te noter.</dd>
                </div>
                <div className="reveal" data-delay="2">
                  <dt>Remonté quand tu veux</dt>
                  <dd>Tu peux la remettre en tête de liste jusqu&apos;à 5 fois par jour, sans payer.</dd>
                </div>
                <div className="reveal" data-delay="3">
                  <dt>Compté au classement</dt>
                  <dd>Chaque code publié te rapporte 10 XP au classement des parrains.</dd>
                </div>
              </dl>
              <div className="hp-actions reveal">
                <Link href="/publier" className="btn btn-accent">Publier mon code</Link>
                <Link href="/classement" className="btn btn-ghost">Voir le classement</Link>
              </div>
            </div>

            <div className="hp-annonce reveal" data-delay="2" aria-hidden="true">
              <div className="hp-annonce-head">
                <span className="hp-annonce-avatar">T</span>
                <span>
                  <span className="hp-annonce-pseudo">toi</span>
                  <span className="hp-annonce-date">publié aujourd&apos;hui</span>
                </span>
              </div>
              <div className="hp-annonce-ticket">
                <span className="code-str">TONCODE</span>
                <span className="hp-annonce-copy">Copier</span>
              </div>
              <div className="hp-annonce-foot">
                <span>Page {d.journey.brand}</span>
                <span className="hp-annonce-bump">Remonter</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Catégories ────────────────────────────────────────────────── */}
        <section className="band-paper hp-cats">
          <div className="wrap">
            <h2 className="reveal">Par type de compte</h2>
            <ul className="hp-cat-list">
              {CATEGORIES.map((c, i) => (
                <li key={c.slug} className="reveal" data-delay={String(i % 2)}>
                  <Link href={`/code-parrainage/categorie/${c.slug}`} className="hp-cat">
                    <span className="hp-cat-name">{c.label}</span>
                    <span className="hp-cat-line">{CAT_LINES[c.slug] ?? c.metaDescription}</span>
                    <span className="hp-cat-count tnum">
                      {d.catCounts[c.slug] ?? 0} marque{(d.catCounts[c.slug] ?? 0) > 1 ? 's' : ''} avec des codes
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 5. Questions ─────────────────────────────────────────────────── */}
        <section className="hp-faq">
          <div className="wrap hp-faq-grid">
            <h2 className="reveal">Questions fréquentes</h2>
            <div>
              {FAQ.map((f) => (
                <details key={f.q} className="hp-qa reveal">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
              <Link href="/faq" className="hp-more">Toutes les questions</Link>
            </div>
          </div>
        </section>

        {/* ── 6. Dernier écran ─────────────────────────────────────────────── */}
        <section className="hp-final">
          <div className="wrap">
            <h2 className="display-wide reveal">Avant de valider une inscription, cherche le code.</h2>
            <form className="hp-search hp-search-final reveal" data-delay="1" action="/codes" method="get" role="search">
              <label htmlFor="hp-q2" className="hp-search-label">Quelle marque ?</label>
              <div className="hp-search-row">
                <input id="hp-q2" name="search" type="search" placeholder="Fortuneo, Revolut, iGraal…" autoComplete="off" />
                <button type="submit" className="btn btn-ink">Chercher</button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  )
}
