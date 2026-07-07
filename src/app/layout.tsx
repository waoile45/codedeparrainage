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
  title: {
    default: 'Code Parrainage 2026 : Codes Vérifiés sur +2700 Marques (Banque, Crypto…)',
    template: '%s | codedeparrainage.com',
  },
  description: 'Trouve un code parrainage vérifié : Boursobank, Revolut, Betclic et +2700 marques référencées. Parrainage gamifié avec XP, badges et classements.',
  keywords: ['code parrainage', 'parrainage boursobank', 'code parrainage revolut', 'parrainage banque', 'code parrainage 2026', 'parrainage crypto'],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    siteName: 'codedeparrainage.com',
    locale: 'fr_FR',
    type: 'website',
    title: 'Code Parrainage 2026 : Codes Vérifiés sur +2700 Marques',
    description: 'Trouve un code parrainage vérifié : Boursobank, Revolut, Betclic et +2700 marques référencées.',
    images: [{ url: '/logo.png', width: 400, height: 400, alt: 'codedeparrainage.com' }],
  },
  twitter: {
    card: 'summary',
    title: 'Code Parrainage 2026 : Codes Vérifiés sur +2700 Marques',
    description: 'Trouve un code parrainage vérifié : Boursobank, Revolut, Betclic et +2700 marques référencées.',
  },
  alternates: {
    canonical: 'https://www.codedeparrainage.com',
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