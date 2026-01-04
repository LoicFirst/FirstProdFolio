import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Loic Mazagran | Réalisateur & Créateur de Contenus Visuels",
    template: "%s | Loic Mazagran"
  },
  description: "Portfolio de Loic Mazagran - Réalisateur, monteur et créateur de contenus visuels spécialisé dans les courts-métrages, la vidéo et la photo.",
  keywords: ["portfolio", "réalisateur", "vidéo", "photographie", "courts-métrages", "Loic Mazagran", "monteur", "créateur de contenus", "cinéma", "production vidéo"],
  authors: [{ name: "Loic Mazagran" }],
  creator: "Loic Mazagran",
  publisher: "Loic Mazagran",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://loicmazagran.com"),
  alternates: {
    canonical: "/",
    languages: {
      'fr-FR': '/',
    },
  },
  openGraph: {
    title: "Loic Mazagran | Réalisateur & Créateur de Contenus Visuels",
    description: "Découvrez mes courts-métrages, vidéos et photographies. Réalisateur et monteur avec plus de 5 ans d'expérience.",
    type: "website",
    locale: "fr_FR",
    siteName: "Loic Mazagran Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loic Mazagran | Réalisateur & Créateur de Contenus Visuels",
    description: "Portfolio de Loic Mazagran - Réalisateur, monteur et créateur de contenus visuels.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
};

// Schema.org JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Loic Mazagran",
  "jobTitle": "Réalisateur & Créateur de Contenus Visuels",
  "description": "Réalisateur, monteur et créateur de contenus visuels spécialisé dans les courts-métrages, la vidéo et la photo.",
  "url": process.env.NEXT_PUBLIC_SITE_URL || "https://loicmazagran.com",
  "sameAs": [],
  "knowsAbout": ["Réalisation", "Montage vidéo", "Photographie", "Courts-métrages", "Production vidéo"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-black text-white min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
