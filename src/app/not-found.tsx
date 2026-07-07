import Navbar from '@/components/Navbar'

// 404 global — remplace l'ancien soft-404 (« Entreprise introuvable » servi en 200)
export default function NotFound() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "var(--font-dm-sans),'DM Sans',sans-serif", color: 'var(--text-strong)' }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '6rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }} aria-hidden="true">😕</div>
        <h1 style={{ fontFamily: "var(--font-syne),Syne,sans-serif", fontWeight: 800, fontSize: '1.4rem', margin: 0 }}>
          Page introuvable
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', margin: 0, maxWidth: 420 }}>
          Cette page n'existe pas ou n'existe plus. Tu cherchais peut-être un code de parrainage ?
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/codes" style={{ background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '.875rem', padding: '.7rem 1.5rem', borderRadius: 12, textDecoration: 'none' }}>
            Voir tous les codes
          </a>
          <a href="/" style={{ background: 'var(--bg-card-md)', border: '1px solid var(--border)', color: 'var(--text-strong)', fontWeight: 600, fontSize: '.875rem', padding: '.7rem 1.5rem', borderRadius: 12, textDecoration: 'none' }}>
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  )
}
