import { ImageResponse } from 'next/og'

// Image de partage par défaut (1200×630). Couleurs en dur : Satori (moteur de
// next/og) ne connaît pas les variables CSS, et impose display:flex sur tout
// <div> à plusieurs enfants. Pas de marque de paris sportifs ici : l'image
// circule sans le message de mise en garde obligatoire.
export const alt = 'codedeparrainage.com : codes de parrainage partagés par la communauté'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const INK = '#141414'
const PAPER = '#FAF8F3'
const YELLOW = '#FFD43B'
const BRANDS = ['Fortuneo', 'Revolut', 'Boursobank', 'Trade Republic', 'iGraal']

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
          padding: '68px 80px',
          background: '#121211',
          color: PAPER,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 34, fontWeight: 800 }}>
          <svg width="56" height="40" viewBox="0 0 40 29">
            <path d="M4 0h32a4 4 0 0 1 4 4v6.5a4 4 0 0 0 0 8V25a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4v-6.5a4 4 0 0 0 0-8V4a4 4 0 0 1 4-4z" fill={YELLOW} />
            <path d="M27 4v21" stroke={INK} strokeWidth="2" strokeDasharray="2.4 2.6" strokeLinecap="round" />
            <path d="M13.5 9.2v10.6M8.2 14.5h10.6" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>code</span>
            <span style={{ background: YELLOW, color: INK, padding: '0 8px', margin: '0 3px', borderRadius: 5 }}>de</span>
            <span>parrainage.com</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', fontSize: 84, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2 }}>
            <span style={{ marginRight: 22 }}>Ne t&apos;inscris plus sans</span>
            <span style={{ background: YELLOW, color: INK, padding: '0 14px', borderRadius: 8 }}>code parrainage.</span>
          </div>
          <div style={{ display: 'flex', fontSize: 32, color: 'rgba(250,248,243,0.72)' }}>
            Des codes publiés par des clients des marques. Tu copies, tu colles, la prime est pour toi.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          {BRANDS.map((b) => (
            <div
              key={b}
              style={{
                display: 'flex',
                padding: '10px 20px',
                borderRadius: 12,
                border: '2px solid rgba(250,248,243,0.18)',
                fontSize: 26,
                color: 'rgba(250,248,243,0.86)',
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
