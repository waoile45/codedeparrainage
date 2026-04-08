"use client";

import Navbar from "@/components/Navbar";

const FAQ = [
  {
    q: "Comment gagner de l'XP ?",
    a: "Tu gagnes de l'XP en publiant des codes de parrainage (+10 XP par code), en te connectant plusieurs jours d'affilée (streak), en atteignant des jalons XP et en laissant des avis sur la plateforme (+15 XP).",
  },
  {
    q: "Comment publier un code de parrainage ?",
    a: "Clique sur « + Publier » dans la barre de navigation, choisis ton entreprise, entre ton code et une description, puis valide. Ton code est immédiatement visible par la communauté.",
  },
  {
    q: "Comment monter dans le classement ?",
    a: "Le classement est basé sur le total d'XP. Plus tu publies de codes, plus tu te connectes régulièrement et plus tu interagis avec la communauté, plus vite tu montes.",
  },
  {
    q: "Qu'est-ce que le streak ?",
    a: "Le streak compte le nombre de jours consécutifs où tu te connectes. Il remet à zéro si tu rates un jour. Un streak de 7 jours te rapporte 25 XP bonus.",
  },
  {
    q: "Comment booster mon annonce ?",
    a: "Tu peux booster une annonce depuis ton profil (onglet Crédits & Boosts). Un boost fait remonter ton annonce en tête des résultats et lui donne une mise en avant verte.",
  },
  {
    q: "Puis-je modifier ou supprimer mon code ?",
    a: "Oui. Sur la page /codes, tes propres annonces affichent des boutons « Modifier » et « Supprimer » à la place des boutons Contacter/Avis.",
  },
  {
    q: "Combien de codes puis-je publier ?",
    a: "Tu peux publier autant de codes que tu veux, dans des entreprises différentes. La quête « Publier 5 annonces » te rapporte 30 XP supplémentaires.",
  },
];

export default function FaqPage() {
  return (
    <>
      <style>{`
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        details summary::-webkit-details-marker { display:none; }
        details[open] .faq-arrow { transform:rotate(180deg); }
      `}</style>
      <Navbar />
      <main style={{ maxWidth:720, margin:"0 auto", padding:"3rem 1.5rem 6rem", fontFamily:"var(--font-dm-sans),'DM Sans',sans-serif" }}>
        <div style={{ marginBottom:"2rem" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:".72rem", fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"#7c3aed", marginBottom:".75rem" }}>
            <span style={{ width:18, height:1, background:"#7c3aed", display:"block" }} />
            FAQ
          </div>
          <h1 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"clamp(1.5rem,3.5vw,2rem)", color:"var(--text-strong)", letterSpacing:"-.03em", marginBottom:".375rem" }}>
            Comment gagner de l&apos;XP ?
          </h1>
          <p style={{ color:"var(--text-dim)", fontSize:".875rem" }}>Tout ce qu&apos;il faut savoir pour progresser sur codedeparrainage.com</p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:".625rem", marginBottom:"2.5rem" }}>
          {FAQ.map((item, i) => (
            <details key={i} style={{ background:"var(--bg-card)", border:"1px solid var(--border)", borderRadius:16, padding:"1rem 1.25rem" }}>
              <summary style={{ fontSize:".9rem", fontWeight:600, color:"var(--text-strong)", cursor:"pointer", listStyle:"none", display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                {item.q}
                <span className="faq-arrow" style={{ color:"var(--text-faint)", fontSize:".75rem", flexShrink:0, transition:"transform .2s" }}>▼</span>
              </summary>
              <p style={{ fontSize:".875rem", color:"var(--text-muted)", margin:".75rem 0 0", lineHeight:1.65 }}>{item.a}</p>
            </details>
          ))}
        </div>

        <div style={{ background:"rgba(124,58,237,.1)", border:"1px solid rgba(124,58,237,.3)", borderRadius:20, padding:"1.75rem", textAlign:"center" }}>
          <div style={{ fontSize:"2rem", marginBottom:".75rem" }}>🚀</div>
          <h2 style={{ fontFamily:"var(--font-syne),Syne,sans-serif", fontWeight:800, fontSize:"1.25rem", color:"var(--text-strong)", marginBottom:".5rem" }}>
            Prêt à gagner de l&apos;XP ?
          </h2>
          <p style={{ fontSize:".875rem", color:"var(--text-muted)", marginBottom:"1.25rem" }}>Publie ton premier code de parrainage et commence à grimper dans le classement.</p>
          <a href="/publier" style={{ display:"inline-flex", alignItems:"center", gap:7, background:"#7c3aed", color:"#fff", fontWeight:700, fontSize:".875rem", padding:".75rem 1.5rem", borderRadius:13, textDecoration:"none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Publier mon code
          </a>
        </div>
      </main>
    </>
  );
}
