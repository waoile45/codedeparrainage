import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Footer from "@/components/Footer";

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
    default: 'codedeparrainage.com — Codes de parrainage vérifiés',
    template: '%s | codedeparrainage.com',
  },
  description: 'Trouvez les meilleurs codes de parrainage français : BoursoBank, Winamax, Revolut, Betclic, Trade Republic. Codes vérifiés par la communauté, mis à jour en temps réel.',
  openGraph: {
    siteName: 'codedeparrainage.com',
    locale: 'fr_FR',
    type: 'website',
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
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}