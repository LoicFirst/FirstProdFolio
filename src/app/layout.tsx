import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingContact from "@/components/FloatingContact";

export const metadata: Metadata = {
  title: "Loic Mazagran | Réalisateur & Créateur de Contenus Visuels",
  description: "Portfolio de Loic Mazagran - Réalisateur, monteur et créateur de contenus visuels spécialisé dans les courts-métrages, la vidéo et la photo.",
  keywords: ["portfolio", "réalisateur", "vidéo", "photographie", "courts-métrages", "Loic Mazagran"],
  authors: [{ name: "Loic Mazagran" }],
  openGraph: {
    title: "Loic Mazagran | Réalisateur & Créateur de Contenus Visuels",
    description: "Découvrez mes courts-métrages, vidéos et photographies. Réalisateur et monteur avec plus de 5 ans d'expérience.",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loic Mazagran | Réalisateur & Créateur de Contenus Visuels",
    description: "Portfolio de Loic Mazagran - Réalisateur, monteur et créateur de contenus visuels.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-black text-white min-h-screen font-sans">
        <Header />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
