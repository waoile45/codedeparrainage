import Navbar from '@/components/Navbar'
import { Search } from "@/components/Pictos";

// 404 global — remplace l'ancien soft-404 (« Entreprise introuvable » servi en 200)
export default function NotFound() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: "var(--font-text)", color: 'var(--text-strong)' }}>
      <Navbar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '6rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
        <div style={{ color: 'var(--text-dim)' }} aria-hidden="true"><Search size={48} /></div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: '1.4rem', margin: 0 }}>
          Page introuvable
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', margin: 0, maxWidth: 420 }}>
          Cette page n'existe pas ou n'existe plus. Tu cherchais peut-être un code de parrainage ?
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/codes" style={{ background: 'var(--accent)', color: 'var(--accent-ink)', fontWeight: 700, fontSize: '.875rem', padding: '.7rem 1.5rem', borderRadius: 12, textDecoration: 'none' }}>
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
