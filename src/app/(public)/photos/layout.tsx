import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photos | Loic Mazagran - Photographe',
  description: 'Galerie photos de Loic Mazagran. Portrait, paysage, photographie de rue et architecture.',
  openGraph: {
    title: 'Photos | Loic Mazagran',
    description: 'Galerie photos - Portrait, paysage, photographie de rue.',
    type: 'website',
  },
};

export default function PhotosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
