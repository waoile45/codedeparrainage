import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import ParticlesBackground from "@/components/ParticlesBackground";
import StickyBanner from "@/components/StickyBanner";
import { safeJsonLd } from "@/lib/sanitize";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    icon: '/logo-192.png',
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
      className={`${syne.variable} ${dmSans.variable} h-full antialiased`}
    >
<body className="min-h-full flex flex-col bg-[#0A0A0F] font-sans">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }} />
        <ThemeProvider>
          <ParticlesBackground />
          {children}
          <Footer />
          <StickyBanner />
        </ThemeProvider>
      </body>
    </html>
  );
}