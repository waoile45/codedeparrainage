import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Footer from "@/components/Footer";
import ParticlesBackground from "@/components/ParticlesBackground";
import StickyBanner from "@/components/StickyBanner";

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
    default: 'Code Parrainage 2026 : +4200 Codes Vérifiés (Boursobank, Banque, Crypto…)',
    template: '%s | codedeparrainage.com',
  },
  description: 'Trouve des codes parrainage Boursobank, Revolut, banques et +4200 autres. Parrainage gamifié avec XP, badges et classements. Codes vérifiés quotidiennement.',
  keywords: ['code parrainage', 'parrainage boursobank', 'code parrainage revolut', 'parrainage banque', 'code parrainage 2026', 'parrainage crypto'],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    siteName: 'codedeparrainage.com',
    locale: 'fr_FR',
    type: 'website',
    title: 'Code Parrainage 2026 : +4200 Codes Vérifiés',
    description: 'Trouve des codes parrainage Boursobank, Revolut, banques et +4200 autres. Codes vérifiés quotidiennement.',
    images: [{ url: '/logo.png', width: 400, height: 400, alt: 'codedeparrainage.com' }],
  },
  twitter: {
    card: 'summary',
    title: 'Code Parrainage 2026 : +4200 Codes Vérifiés',
    description: 'Trouve des codes parrainage Boursobank, Revolut, banques et +4200 autres.',
  },
  alternates: {
    canonical: 'https://www.codedeparrainage.com',
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