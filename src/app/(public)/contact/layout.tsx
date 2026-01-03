import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Loic Mazagran - Réalisateur',
  description: 'Contactez Loic Mazagran pour vos projets de vidéo, courts-métrages ou photographie. Disponible pour de nouvelles collaborations.',
  openGraph: {
    title: 'Contact | Loic Mazagran',
    description: 'Contactez-moi pour vos projets créatifs.',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
