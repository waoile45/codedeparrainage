"use client";

import Navbar from "@/components/Navbar";

// ── Shared layout ──────────────────────────────────────────────────────────────
function LegalLayout({ title, lastUpdate, children }: { title:string; lastUpdate:string; children:React.ReactNode }) {
  return (
    <>
      <style>{`
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#0A0A0F; color:#e2e8f0; font-family:'DM Sans',sans-serif; min-height:100vh; }

        .legal-page { max-width:760px; margin:0 auto; padding:3rem 1.5rem 6rem; }

        .legal-header { margin-bottom:2.5rem; padding-bottom:1.5rem; border-bottom:1px solid rgba(255,255,255,.07); }
        .legal-label { display:inline-flex; align-items:center; gap:6px; font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#7c3aed; margin-bottom:.75rem; }
        .legal-label::before { content:''; width:18px; height:1px; background:#7c3aed; display:block; }
        .legal-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(1.5rem,3.5vw,2rem); color:#fff; letter-spacing:-.03em; margin-bottom:.5rem; }
        .legal-update { font-size:.78rem; color:rgba(255,255,255,.3); }

        .legal-body { display:flex; flex-direction:column; gap:2rem; }

        .legal-section { display:flex; flex-direction:column; gap:.75rem; }
        .legal-section h2 { font-family:'Syne',sans-serif; font-weight:700; font-size:1rem; color:#fff; padding-bottom:.5rem; border-bottom:1px solid rgba(255,255,255,.06); }
        .legal-section h3 { font-weight:600; font-size:.9rem; color:rgba(255,255,255,.75); margin-top:.25rem; }
        .legal-section p { font-size:.875rem; color:rgba(255,255,255,.5); line-height:1.75; }
        .legal-section ul { padding-left:1.25rem; display:flex; flex-direction:column; gap:.35rem; }
        .legal-section ul li { font-size:.875rem; color:rgba(255,255,255,.5); line-height:1.7; }
        .legal-section a { color:#a78bfa; text-decoration:none; }
        .legal-section a:hover { text-decoration:underline; }

        .legal-highlight { background:rgba(124,58,237,.07); border:1px solid rgba(124,58,237,.18); border-radius:12px; padding:1rem 1.25rem; }
        .legal-highlight p { color:rgba(255,255,255,.6) !important; }

        .legal-nav { display:flex; flex-wrap:wrap; gap:.5rem; margin-bottom:2.5rem; }
        .legal-nav-link { padding:.35rem .875rem; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:100px; color:rgba(255,255,255,.45); font-size:.78rem; text-decoration:none; transition:all .18s; }
        .legal-nav-link:hover { color:#fff; border-color:rgba(124,58,237,.3); }
        .legal-nav-link.active { background:rgba(124,58,237,.12); border-color:rgba(124,58,237,.3); color:#a78bfa; }

        @media(max-width:600px) { .legal-page { padding:2rem 1rem 5rem; } }
      `}</style>

      <Navbar />

      <main className="legal-page">
        {/* Quick nav between legal pages */}
        <div className="legal-nav">
          <a href="/mentions-legales"  className={`legal-nav-link ${title.includes("Mentions") ? "active":""}`}>Mentions légales</a>
          <a href="/cgu"               className={`legal-nav-link ${title.includes("CGU") || title.includes("Conditions") ? "active":""}`}>CGU</a>
          <a href="/confidentialite"   className={`legal-nav-link ${title.includes("Confidentialit") ? "active":""}`}>Confidentialité</a>
          <a href="/cookies"           className={`legal-nav-link ${title.includes("Cookies") ? "active":""}`}>Cookies</a>
        </div>

        <div className="legal-header">
          <div className="legal-label">Légal</div>
          <h1 className="legal-title">{title}</h1>
          <p className="legal-update">Dernière mise à jour : {lastUpdate}</p>
        </div>

        <div className="legal-body">{children}</div>
      </main>
    </>
  );
}

// ── MENTIONS LÉGALES ──────────────────────────────────────────────────────────
export function MentionsLegales() {
  return (
    <LegalLayout title="Mentions légales" lastUpdate="1er avril 2026">
      <div className="legal-section">
        <h2>1. Éditeur du site</h2>
        <p>Le site <strong style={{ color:"#fff" }}>codedeparrainage.com</strong> est édité par :</p>
        <ul>
          <li>Nom : <strong style={{ color:"rgba(255,255,255,.7)" }}>[Mathy Paul]</strong></li>
          <li>Adresse : <strong style={{ color:"rgba(255,255,255,.7)" }}>[32 rue des montagnes 50120]</strong></li>
          <li>Email : <a href="mailto:contact@codedeparrainage.com">contact@codedeparrainage.com</a></li>
          <li>SIRET : <strong style={{ color:"rgba(255,255,255,.7)" }}>[SIRET]</strong></li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>2. Hébergement</h2>
        <p>Le site est hébergé par :</p>
        <ul>
          <li><strong style={{ color:"rgba(255,255,255,.7)" }}>Vercel Inc.</strong></li>
          <li>340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</li>
          <li><a href="https://vercel.com" target="_blank">vercel.com</a></li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>3. Propriété intellectuelle</h2>
        <p>L'ensemble du contenu de ce site (textes, graphismes, logotypes, icônes, images) est la propriété exclusive de codedeparrainage.com et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
        <p>Toute reproduction, distribution, modification ou utilisation de ces contenus sans autorisation écrite préalable est strictement interdite.</p>
      </div>

      <div className="legal-section">
        <h2>4. Responsabilité</h2>
        <p>codedeparrainage.com agit en tant qu'intermédiaire entre parrains et filleuls. Nous ne sommes pas responsables des offres de parrainage proposées par les utilisateurs, ni des éventuels litiges entre parrains et filleuls.</p>
        <p>Nous nous réservons le droit de supprimer tout contenu qui ne respecterait pas nos conditions d'utilisation.</p>
      </div>

      <div className="legal-section">
        <h2>5. Droit applicable</h2>
        <p>Le présent site est soumis au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
      </div>
    </LegalLayout>
  );
}

// ── CGU ───────────────────────────────────────────────────────────────────────
export function CGU() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" lastUpdate="1er avril 2026">
      <div className="legal-highlight">
        <p>En utilisant codedeparrainage.com, vous acceptez les présentes CGU dans leur intégralité. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.</p>
      </div>

      <div className="legal-section">
        <h2>1. Description du service</h2>
        <p>codedeparrainage.com est une plateforme communautaire gamifiée permettant aux utilisateurs de :</p>
        <ul>
          <li>Publier des codes de parrainage pour des entreprises partenaires</li>
          <li>Trouver des codes de parrainage publiés par d'autres utilisateurs</li>
          <li>Gagner des points d'expérience (XP) et des récompenses</li>
          <li>Interagir avec d'autres parrains via la messagerie interne</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>2. Inscription et compte utilisateur</h2>
        <h3>2.1 Conditions d'accès</h3>
        <p>L'utilisation du service est réservée aux personnes majeures (18 ans et plus). En vous inscrivant, vous certifiez avoir l'âge requis.</p>
        <h3>2.2 Responsabilité du compte</h3>
        <p>Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toute activité effectuée depuis votre compte.</p>
        <h3>2.3 Exactitude des informations</h3>
        <p>Vous vous engagez à fournir des informations exactes et à jour lors de votre inscription et dans vos publications.</p>
      </div>

      <div className="legal-section">
        <h2>3. Règles de publication</h2>
        <p>En publiant un code de parrainage, vous garantissez que :</p>
        <ul>
          <li>Le code est valide et actif au moment de la publication</li>
          <li>Vous êtes bien le parrain légitime de ce code</li>
          <li>Le code n'est pas frauduleux, expiré ou inventé</li>
          <li>Vous mettrez à jour ou supprimerez le code s'il expire</li>
        </ul>
        <p>Tout abus (faux codes, spam, codes dupliqués) entraînera la suppression du compte sans préavis.</p>
      </div>

      <div className="legal-section">
        <h2>4. Système de points XP et récompenses</h2>
        <p>Les points XP sont attribués à titre gratuit et ne constituent pas une monnaie ayant cours légal. Ils ne peuvent pas être échangés contre de l'argent.</p>
        <p>Les récompenses mensuelles (crédits boost, badges) sont attribuées selon le classement en fin de mois et peuvent être modifiées par codedeparrainage.com sans préavis.</p>
      </div>

      <div className="legal-section">
        <h2>5. Crédits Boost</h2>
        <p>Les crédits Boost sont achetés en euros via Stripe. Ils permettent de mettre en avant des annonces sur la plateforme.</p>
        <ul>
          <li>Les crédits n'ont pas de date d'expiration</li>
          <li>Les crédits ne sont pas remboursables sauf en cas de dysfonctionnement technique avéré</li>
          <li>Les crédits ne peuvent pas être transférés à un autre compte</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>6. Comportement interdit</h2>
        <p>Il est strictement interdit de :</p>
        <ul>
          <li>Publier des codes frauduleux ou expirés intentionnellement</li>
          <li>Harceler, menacer ou insulter d'autres utilisateurs</li>
          <li>Tenter de contourner le système de gamification</li>
          <li>Utiliser des bots ou scripts automatisés</li>
          <li>Créer plusieurs comptes pour abuser du système</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>7. Suspension et suppression de compte</h2>
        <p>Nous nous réservons le droit de suspendre ou supprimer tout compte qui ne respecterait pas les présentes CGU, sans obligation de remboursement des crédits restants en cas de violation avérée.</p>
      </div>

      <div className="legal-section">
        <h2>8. Modification des CGU</h2>
        <p>Nous pouvons modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email en cas de modification substantielle. La continuation de l'utilisation du service vaut acceptation des nouvelles CGU.</p>
      </div>

      <div className="legal-section">
        <h2>9. Contact</h2>
        <p>Pour toute question relative aux présentes CGU : <a href="mailto:contact@codedeparrainage.com">contact@codedeparrainage.com</a></p>
      </div>
    </LegalLayout>
  );
}

// ── CONFIDENTIALITÉ ───────────────────────────────────────────────────────────
export function Confidentialite() {
  return (
    <LegalLayout title="Politique de confidentialité" lastUpdate="1er avril 2026">
      <div className="legal-highlight">
        <p>Conformément au RGPD (Règlement Général sur la Protection des Données) et à la loi Informatique et Libertés, nous vous informons de la façon dont nous collectons et utilisons vos données personnelles.</p>
      </div>

      <div className="legal-section">
        <h2>1. Responsable du traitement</h2>
        <p>Le responsable du traitement des données est l'éditeur de codedeparrainage.com dont les coordonnées figurent dans les mentions légales.</p>
      </div>

      <div className="legal-section">
        <h2>2. Données collectées</h2>
        <h3>2.1 Lors de l'inscription</h3>
        <ul>
          <li>Adresse email</li>
          <li>Pseudo (nom d'affichage)</li>
          <li>Mot de passe (chiffré, jamais stocké en clair)</li>
        </ul>
        <h3>2.2 Lors de l'utilisation</h3>
        <ul>
          <li>Codes de parrainage publiés</li>
          <li>Messages échangés avec d'autres utilisateurs</li>
          <li>Points XP, badges et historique de progression</li>
          <li>Historique des achats de crédits</li>
          <li>Adresse IP et données de connexion</li>
        </ul>
        <h3>2.3 Données de paiement</h3>
        <p>Les données bancaires sont traitées exclusivement par <strong style={{ color:"rgba(255,255,255,.7)" }}>Stripe</strong>. Nous ne stockons aucune donnée de carte bancaire sur nos serveurs.</p>
      </div>

      <div className="legal-section">
        <h2>3. Finalités du traitement</h2>
        <p>Vos données sont utilisées pour :</p>
        <ul>
          <li>Gérer votre compte et authentification (base légale : exécution du contrat)</li>
          <li>Afficher votre profil et vos annonces publiquement (base légale : consentement)</li>
          <li>Traiter vos paiements de crédits (base légale : exécution du contrat)</li>
          <li>Calculer votre classement et vos XP (base légale : intérêt légitime)</li>
          <li>Vous envoyer des notifications relatives à votre compte (base légale : intérêt légitime)</li>
          <li>Prévenir la fraude et les abus (base légale : obligation légale)</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>4. Partage des données</h2>
        <p>Nous ne vendons jamais vos données personnelles. Elles peuvent être partagées avec :</p>
        <ul>
          <li><strong style={{ color:"rgba(255,255,255,.7)" }}>Supabase</strong> — hébergement de la base de données (serveurs en Europe)</li>
          <li><strong style={{ color:"rgba(255,255,255,.7)" }}>Vercel</strong> — hébergement du site</li>
          <li><strong style={{ color:"rgba(255,255,255,.7)" }}>Stripe</strong> — traitement des paiements</li>
          <li>Autorités compétentes si requis par la loi</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>5. Durée de conservation</h2>
        <ul>
          <li>Données de compte : jusqu'à suppression du compte + 1 an</li>
          <li>Données de paiement : 10 ans (obligation légale comptable)</li>
          <li>Logs de connexion : 1 an</li>
          <li>Messages : jusqu'à suppression du compte</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>6. Vos droits</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li><strong style={{ color:"rgba(255,255,255,.7)" }}>Droit d'accès</strong> — obtenir une copie de vos données</li>
          <li><strong style={{ color:"rgba(255,255,255,.7)" }}>Droit de rectification</strong> — corriger vos données inexactes</li>
          <li><strong style={{ color:"rgba(255,255,255,.7)" }}>Droit à l'effacement</strong> — demander la suppression de vos données</li>
          <li><strong style={{ color:"rgba(255,255,255,.7)" }}>Droit à la portabilité</strong> — recevoir vos données dans un format lisible</li>
          <li><strong style={{ color:"rgba(255,255,255,.7)" }}>Droit d'opposition</strong> — vous opposer à certains traitements</li>
        </ul>
        <p>Pour exercer ces droits : <a href="mailto:contact@codedeparrainage.com">contact@codedeparrainage.com</a></p>
        <p>Vous pouvez également introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank">CNIL</a>.</p>
      </div>

      <div className="legal-section">
        <h2>7. Sécurité</h2>
        <p>Nous mettons en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement HTTPS, mots de passe hachés (bcrypt), accès aux données restreint.</p>
      </div>
    </LegalLayout>
  );
}

// ── COOKIES ───────────────────────────────────────────────────────────────────
export function CookiesPage() {
  return (
    <LegalLayout title="Politique de cookies" lastUpdate="1er avril 2026">
      <div className="legal-highlight">
        <p>Un cookie est un petit fichier texte déposé sur votre navigateur lors de votre visite sur notre site. Voici comment nous les utilisons.</p>
      </div>

      <div className="legal-section">
        <h2>1. Cookies strictement nécessaires</h2>
        <p>Ces cookies sont indispensables au fonctionnement du site. Ils ne peuvent pas être désactivés.</p>
        <ul>
          <li><strong style={{ color:"rgba(255,255,255,.7)" }}>Session d'authentification</strong> — maintient ta connexion active (Supabase Auth)</li>
          <li><strong style={{ color:"rgba(255,255,255,.7)" }}>Sécurité CSRF</strong> — protège contre les attaques de type Cross-Site Request Forgery</li>
          <li><strong style={{ color:"rgba(255,255,255,.7)" }}>Turnstile (Cloudflare)</strong> — protection anti-bot sur les formulaires d'inscription et de connexion</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>2. Cookies fonctionnels</h2>
        <p>Ces cookies améliorent votre expérience mais ne sont pas obligatoires.</p>
        <ul>
          <li><strong style={{ color:"rgba(255,255,255,.7)" }}>Préférences d'affichage</strong> — mémorise tes filtres et préférences de navigation</li>
          <li><strong style={{ color:"rgba(255,255,255,.7)" }}>Panier de crédits</strong> — conserve ta sélection lors d'un achat</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>3. Cookies de paiement</h2>
        <p><strong style={{ color:"rgba(255,255,255,.7)" }}>Stripe</strong> dépose des cookies nécessaires au traitement sécurisé des paiements. Ces cookies sont soumis à la politique de confidentialité de Stripe.</p>
      </div>

      <div className="legal-section">
        <h2>4. Cookies tiers</h2>
        <p>Nous n'utilisons pas de cookies publicitaires ou de tracking tiers (Google Analytics, Facebook Pixel, etc.). Votre navigation reste privée.</p>
      </div>

      <div className="legal-section">
        <h2>5. Gestion des cookies</h2>
        <p>Vous pouvez contrôler et supprimer les cookies via les paramètres de votre navigateur :</p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent" target="_blank">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank">Safari</a></li>
          <li><a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge" target="_blank">Microsoft Edge</a></li>
        </ul>
        <p>Attention : désactiver les cookies nécessaires peut empêcher la connexion à votre compte.</p>
      </div>

      <div className="legal-section">
        <h2>6. Contact</h2>
        <p>Pour toute question relative aux cookies : <a href="mailto:contact@codedeparrainage.com">contact@codedeparrainage.com</a></p>
      </div>
    </LegalLayout>
  );
}