import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À propos | Loic Mazagran - Réalisateur',
  description: 'Découvrez le parcours de Loic Mazagran, réalisateur et monteur avec plus de 5 ans d\'expérience dans la création de courts-métrages.',
  openGraph: {
    title: 'À propos | Loic Mazagran',
    description: 'Découvrez mon parcours et mes compétences.',
    type: 'profile',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
