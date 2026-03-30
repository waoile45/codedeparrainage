'use client'

import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.15 }
    )
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const isVisible = (id: string) => visibleSections.has(id)

  const categories = [
    { icon: '🏦', name: 'Banque', count: 342, color: '#3B5BDB' },
    { icon: '⚽', name: 'Paris sportifs', count: 276, color: '#F59F00' },
    { icon: '💸', name: 'Cashback', count: 201, color: '#2F9E44' },
    { icon: '⚡', name: 'Énergie', count: 189, color: '#0CA678' },
    { icon: '📱', name: 'Téléphonie', count: 94, color: '#E64980' },
    { icon: '₿', name: 'Crypto', count: 118, color: '#7048E8' },
  ]

  const steps = [
    {
      num: '01',
      title: 'Inscris-toi gratuitement',
      desc: 'Crée ton compte en 30 secondes. Pas de carte bancaire requise.',
      icon: '✦',
    },
    {
      num: '02',
      title: 'Publie ton code',
      desc: 'Partage ton code de parrainage et gagne +10 XP immédiatement.',
      icon: '◈',
    },
    {
      num: '03',
      title: 'Monte de niveau',
      desc: 'Accumule des XP, débloque des badges et grimpe dans le classement.',
      icon: '⬡',
    },
  ]

  const brands = [
    'Boursobank', 'Winamax', 'Fortuneo', 'Free', 'Binance',
    'BetClic', 'Hello Bank', 'Coinbase', 'Revolut', 'N26',
  ]

  const testimonials = [
    { name: 'Marie T.', level: 'Parrain Or', xp: '2 340 XP', text: 'J\'ai gagné 80€ de bonus en un mois. La gamification rend ça vraiment addictif !', avatar: 'MT' },
    { name: 'Lucas B.', level: 'Super Parrain', xp: '5 120 XP', text: 'Le meilleur site de parrainage en France. Interface top, communauté active.', avatar: 'LB' },
    { name: 'Sophie K.', level: 'Parrain Argent', xp: '780 XP', text: 'J\'adore le système de badges. Ça motive vraiment à être actif !', avatar: 'SK' },
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F0EEF8', fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .fade-up { opacity: 0; transform: translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .fade-left { opacity: 0; transform: translateX(-40px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .fade-left.visible { opacity: 1; transform: translateX(0); }
        .fade-right { opacity: 0; transform: translateX(40px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .fade-right.visible { opacity: 1; transform: translateX(0); }
        .delay-1 { transition-delay: 0.1s; }
        .delay-2 { transition-delay: 0.2s; }
        .delay-3 { transition-delay: 0.3s; }
        .delay-4 { transition-delay: 0.4s; }
        .delay-5 { transition-delay: 0.5s; }
        .btn-primary {
          background: #7C3AED;
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-primary:hover { background: #6D28D9; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(124,58,237,0.35); }
        .btn-ghost {
          background: transparent;
          color: #F0EEF8;
          border: 1px solid rgba(240,238,248,0.2);
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-ghost:hover { background: rgba(240,238,248,0.08); border-color: rgba(240,238,248,0.4); }
        .card-cat {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.25s;
          text-decoration: none;
          display: block;
        }
        .card-cat:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); transform: translateY(-4px); }
        .tag-brand {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 13px;
          color: rgba(240,238,248,0.75);
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          white-space: nowrap;
        }
        .tag-brand:hover { background: rgba(124,58,237,0.15); border-color: rgba(124,58,237,0.4); color: #C4B5FD; }
        .xp-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(124,58,237,0.2);
          border: 1px solid rgba(124,58,237,0.35);
          color: #C4B5FD;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .floating-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 16px 20px;
          backdrop-filter: blur(10px);
        }
        @keyframes float1 { 0%,100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-12px) rotate(-2deg); } }
        @keyframes float2 { 0%,100% { transform: translateY(0px) rotate(3deg); } 50% { transform: translateY(-16px) rotate(3deg); } }
        @keyframes float3 { 0%,100% { transform: translateY(0px) rotate(-1deg); } 50% { transform: translateY(-8px) rotate(-1deg); } }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 20px rgba(124,58,237,0.3); } 50% { box-shadow: 0 0 40px rgba(124,58,237,0.6); } }
        .nav-link { color: rgba(240,238,248,0.65); text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .nav-link:hover { color: #F0EEF8; }
        .section-label { font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #7C3AED; margin-bottom: 12px; }
        .glow-dot { width: 8px; height: 8px; border-radius: 50%; background: #22C55E; box-shadow: 0 0 8px #22C55E; display: inline-block; }
        .step-line { position: absolute; left: 32px; top: 64px; bottom: -32px; width: 1px; background: linear-gradient(to bottom, rgba(124,58,237,0.5), transparent); }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, right: 0, zIndex: 100, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: scrollY > 40 ? 'rgba(10,10,15,0.92)' : 'transparent', backdropFilter: scrollY > 40 ? 'blur(12px)' : 'none', borderBottom: scrollY > 40 ? '1px solid rgba(255,255,255,0.06)' : 'none', transition: 'all 0.3s', maxWidth: 1200, margin: '0 auto', width: '100%', left: '50%', transform: 'translateX(-50%)' }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
          code<span style={{ color: '#7C3AED' }}>deparrainage</span>.com
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a href="/codes" className="nav-link">Codes</a>
          <a href="/classement" className="nav-link">Classement</a>
          <a href="/login" className="nav-link">Connexion</a>
          <a href="/register" className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>S'inscrire</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', padding: '100px 24px 60px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Orbs de fond */}
        <div style={{ position: 'fixed', top: '10%', left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none', transform: `translateY(${scrollY * 0.1}px)` }} />
        <div style={{ position: 'fixed', top: '30%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,91,219,0.1) 0%, transparent 70%)', pointerEvents: 'none', transform: `translateY(${scrollY * -0.08}px)` }} />

        {/* Contenu gauche */}
        <div style={{ flex: 1, maxWidth: 580, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <span className="glow-dot" />
            <span style={{ fontSize: 13, color: 'rgba(240,238,248,0.55)' }}>+4 200 codes actifs en ce moment</span>
          </div>

          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(42px, 6vw, 72px)', lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: 24 }}>
            Parraine,<br />
            <span style={{ color: '#7C3AED' }}>gagne</span> des<br />
            récompenses.
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(240,238,248,0.6)', marginBottom: 36, maxWidth: 460 }}>
            La plateforme de parrainage gamifiée. Publie ton code, monte de niveau,
            débloque des badges et rejoins 850+ parrains vérifiés.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
            <a href="/codes" className="btn-primary">Trouver un code gratuit</a>
            <a href="/register" className="btn-primary" style={{ background: '#6D28D9' }}>Publier mon code</a>
          </div>

          {/* Stats inline */}
          <div style={{ display: 'flex', gap: 32 }}>
            {[
              { n: '4 200+', l: 'Codes actifs' },
              { n: '850+', l: 'Parrains vérifiés' },
              { n: '97%', l: 'Avis positifs' },
            ].map((s) => (
              <div key={s.l}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: '#F0EEF8' }}>{s.n}</div>
                <div style={{ fontSize: 12, color: 'rgba(240,238,248,0.45)', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cartes flottantes droite */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative', minHeight: 500 }}>

          {/* Carte principale */}
          <div className="floating-card" style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%) rotate(-2deg)', width: 240, animation: 'float1 6s ease-in-out infinite', animationPlayState: scrollY > 200 ? 'paused' : 'running' }}>
            <div style={{ fontSize: 11, color: 'rgba(240,238,248,0.4)', marginBottom: 8 }}>🏆 TOP PARRAIN</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #3B5BDB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👑</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Alexandre M.</div>
                <div style={{ fontSize: 11, color: '#A78BFA' }}>Super Parrain</div>
              </div>
            </div>
            <div style={{ background: 'rgba(124,58,237,0.15)', borderRadius: 8, padding: '6px 10px', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'rgba(240,238,248,0.5)' }}>XP total</span>
              <span style={{ color: '#C4B5FD', fontWeight: 600 }}>5 840 XP</span>
            </div>
          </div>

          {/* Carte notification */}
          <div className="floating-card" style={{ position: 'absolute', right: 220, top: '22%', width: 200, animation: 'float2 7s ease-in-out infinite', animationDelay: '1s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Boost activé</div>
                <div style={{ fontSize: 11, color: 'rgba(240,238,248,0.5)', marginTop: 2 }}>Ton annonce est en tête</div>
              </div>
            </div>
          </div>

          {/* Carte XP */}
          <div className="floating-card" style={{ position: 'absolute', right: 180, bottom: '20%', width: 190, animation: 'float3 5s ease-in-out infinite', animationDelay: '0.5s' }}>
            <div style={{ fontSize: 11, color: 'rgba(240,238,248,0.4)', marginBottom: 6 }}>🎉 Nouveau badge !</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Parrain Bronze</div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '65%', background: 'linear-gradient(90deg, #7C3AED, #A78BFA)', borderRadius: 6 }} />
            </div>
            <div style={{ fontSize: 11, color: 'rgba(240,238,248,0.4)', marginTop: 4, textAlign: 'right' }}>65 / 100 XP</div>
          </div>

          {/* Carte code */}
          <div className="floating-card" style={{ position: 'absolute', right: 10, bottom: '12%', width: 210, animation: 'float1 8s ease-in-out infinite', animationDelay: '2s' }}>
            <div style={{ fontSize: 11, color: 'rgba(240,238,248,0.4)', marginBottom: 6 }}>📋 Code copié</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Boursobank</div>
                <div style={{ fontFamily: 'monospace', fontSize: 15, color: '#A78BFA', marginTop: 2 }}>PAUL2024</div>
              </div>
              <div style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(34,197,94,0.25)' }}>+80€</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATÉGORIES */}
      <section id="cats" data-animate style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div className={`fade-up ${isVisible('cats') ? 'visible' : ''}`}>
          <div className="section-label">Catégories</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: 40, letterSpacing: '-0.02em' }}>
            Parcourir par catégorie
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {categories.map((cat, i) => (
            <a
              key={cat.name}
              href={`/categorie/${cat.name.toLowerCase()}`}
              className={`card-cat fade-up delay-${i + 1} ${isVisible('cats') ? 'visible' : ''}`}
              data-animate
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{cat.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{cat.name}</div>
              <div style={{ fontSize: 12, color: 'rgba(240,238,248,0.4)' }}>{cat.count} codes</div>
              <div style={{ marginTop: 12, height: 2, borderRadius: 2, background: cat.color, width: '40%', opacity: 0.7 }} />
            </a>
          ))}
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section id="how" data-animate style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div className={`fade-up ${isVisible('how') ? 'visible' : ''}`} style={{ marginBottom: 56 }}>
          <div className="section-label">Comment ça marche</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.02em' }}>
            Simple. Rapide. Rentable.
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`fade-up delay-${i + 1} ${isVisible('how') ? 'visible' : ''}`}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 48, fontWeight: 800, color: 'rgba(124,58,237,0.15)', position: 'absolute', top: 12, right: 20, lineHeight: 1 }}>{step.num}</div>
              <div style={{ fontSize: 28, marginBottom: 16 }}>{step.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>{step.title}</div>
              <div style={{ fontSize: 14, color: 'rgba(240,238,248,0.55)', lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* MARQUES POPULAIRES */}
      <section id="brands" data-animate style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div className={`fade-up ${isVisible('brands') ? 'visible' : ''}`} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,238,248,0.35)', marginBottom: 16 }}>Codes populaires</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {brands.map((brand) => (
              <a key={brand} href={`/code-parrainage/${brand.toLowerCase().replace(' ', '-')}`} className="tag-brand">
                Code parrainage {brand}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section id="testi" data-animate style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div className={`fade-up ${isVisible('testi') ? 'visible' : ''}`} style={{ marginBottom: 48 }}>
          <div className="section-label">Témoignages</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.02em' }}>
            Ils en parlent mieux que nous
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`fade-up delay-${i + 1} ${isVisible('testi') ? 'visible' : ''}`}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24 }}
            >
              <div style={{ fontSize: 14, color: 'rgba(240,238,248,0.65)', lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #3B5BDB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: '#A78BFA' }}>{t.level}</span>
                    <span style={{ fontSize: 10, color: 'rgba(240,238,248,0.3)' }}>·</span>
                    <span style={{ fontSize: 11, color: 'rgba(240,238,248,0.35)' }}>{t.xp}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="cta" data-animate style={{ padding: '80px 24px 120px', maxWidth: 1200, margin: '0 auto' }}>
        <div
          className={`fade-up ${isVisible('cta') ? 'visible' : ''}`}
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(59,91,219,0.1) 100%)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 28, padding: 'clamp(40px, 6vw, 80px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
        >
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,91,219,0.15) 0%, transparent 70%)' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="xp-badge" style={{ marginBottom: 20 }}>✦ +10 XP offerts à l'inscription</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 5vw, 52px)', marginBottom: 16, letterSpacing: '-0.03em' }}>
              Prêt à parrainer ?
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(240,238,248,0.55)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
              Rejoins 850+ parrains actifs et commence à gagner des récompenses dès aujourd'hui.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/register" className="btn-primary" style={{ fontSize: 16, padding: '16px 36px', animation: 'pulse-glow 3s ease-in-out infinite' }}>
                Créer mon compte gratuit
              </a>
              <a href="/codes" className="btn-ghost" style={{ fontSize: 16, padding: '16px 36px' }}>
                Voir les codes
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>
            code<span style={{ color: '#7C3AED' }}>deparrainage</span>.com
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="/mentions-legales" style={{ fontSize: 13, color: 'rgba(240,238,248,0.35)', textDecoration: 'none' }}>Mentions légales</a>
            <a href="/cgu" style={{ fontSize: 13, color: 'rgba(240,238,248,0.35)', textDecoration: 'none' }}>CGU</a>
            <a href="/contact" style={{ fontSize: 13, color: 'rgba(240,238,248,0.35)', textDecoration: 'none' }}>Contact</a>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(240,238,248,0.25)' }}>© 2026 codedeparrainage.com</div>
        </div>
      </footer>

    </main>
  )
}