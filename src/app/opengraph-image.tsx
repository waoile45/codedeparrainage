import { ImageResponse } from 'next/og'

// Image de partage par défaut (1200×630) — remplace le logo carré 400×400
// qui était rogné par les réseaux sociaux. S'applique à toutes les routes
// qui ne définissent pas leur propre opengraph-image.
// Satori (moteur de next/og) impose `display:flex` sur tout <div> à plusieurs enfants.
export const alt = 'codedeparrainage.com — codes de parrainage partagés par la communauté'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const BRANDS = ['Boursobank', 'Revolut', 'Winamax', 'Trade Republic', 'Binance', 'iGraal']

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: '#0A0A0F',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, fontWeight: 700 }}>
          <div style={{ display: 'flex', width: 18, height: 18, borderRadius: 9, background: '#7c3aed' }} />
          <div style={{ display: 'flex' }}>
            <span>code</span>
            <span style={{ color: '#7c3aed' }}>de</span>
            <span>parrainage.com</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            <div style={{ display: 'flex' }}>Ton code de parrainage</div>
            <div style={{ display: 'flex', color: '#7c3aed' }}>qui rapporte.</div>
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: 'rgba(255,255,255,0.6)' }}>
            Codes publiés par de vrais parrains — banque, paris sportifs, crypto, cashback
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {BRANDS.map((b) => (
            <div
              key={b}
              style={{
                display: 'flex',
                padding: '10px 20px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.04)',
                fontSize: 24,
                color: 'rgba(255,255,255,0.8)',
              }}
            >
              {b}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
