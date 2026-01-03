import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vidéos | Loic Mazagran - Réalisateur',
  description: 'Découvrez mes courts-métrages, documentaires et projets vidéo. Réalisateur et monteur avec un style visuel unique.',
  openGraph: {
    title: 'Vidéos | Loic Mazagran',
    description: 'Découvrez mes courts-métrages et projets vidéo.',
    type: 'website',
  },
};

export default function VideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
