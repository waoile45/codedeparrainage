import type { Metadata } from "next";
import { Archivo, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import RevealObserver from "@/components/RevealObserver";
import StickyBanner from "@/components/StickyBanner";
import { safeJsonLd } from "@/lib/sanitize";

// Titres : Archivo, variable en largeur (axe wdth) pour la coupe élargie des
// étiquettes de prix. Texte : Hanken Grotesk. Codes à recopier : IBM Plex Mono.
const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-text",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.codedeparrainage.com'),
  // Titre par défaut sobre : chaque page indexable définit son propre titre.
  // Pas de canonical ici : un canonical global pointait toutes les pages sans
  // métadonnées propres (classement, FAQ, forum…) vers la page d'accueil.
  title: {
    default: 'codedeparrainage.com — codes de parrainage partagés par la communauté',
    template: '%s | codedeparrainage.com',
  },
  description:
    'Codes de parrainage publiés par de vrais parrains : banques en ligne, paris sportifs, crypto, cashback, télécom. Copie le code, inscris-toi, touche la prime de bienvenue.',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }, { url: '/logo-192.png', sizes: '192x192' }],
    apple: '/logo-192.png',
  },
  // L'image de partage vient de src/app/opengraph-image.tsx (1200×630).
  openGraph: {
    siteName: 'codedeparrainage.com',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

// JSON-LD globaux : entité Organization + WebSite (avec SearchAction vers /codes)
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'codedeparrainage.com',
  url: 'https://www.codedeparrainage.com',
  logo: 'https://www.codedeparrainage.com/logo.png',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'codedeparrainage.com',
  url: 'https://www.codedeparrainage.com',
  inLanguage: 'fr-FR',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.codedeparrainage.com/codes?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${archivo.variable} ${hanken.variable} ${plexMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Arme les apparitions au défilement ; sans JS, tout reste visible. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-full flex flex-col font-sans" style={{ background: "var(--bg)" }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }} />
        <ThemeProvider>
          <RevealObserver />
          {children}
          <Footer />
          <StickyBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}