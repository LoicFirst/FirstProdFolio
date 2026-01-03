'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaInstagram, FaYoutube, FaVimeoV, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import contactData from '@/data/contact.json';

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  instagram: FaInstagram,
  youtube: FaYoutube,
  vimeo: FaVimeoV,
  linkedin: FaLinkedinIn,
  twitter: FaTwitter,
};

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-bold"
              >
                <span className="text-primary-500">Loic</span>
                <span className="text-white">Mazagran</span>
              </motion.div>
            </Link>
            <p className="text-gray-400 text-sm">
              Réalisateur, monteur et créateur de contenus visuels.
              Transformer vos idées en images qui racontent des histoires.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Navigation</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Accueil' },
                { href: '/videos', label: 'Vidéos' },
                { href: '/photos', label: 'Photos' },
                { href: '/about', label: 'À propos' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary-500 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold">Réseaux sociaux</h3>
            <div className="flex space-x-4">
              {contactData.social.map((social) => {
                const Icon = iconMap[social.icon];
                return (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -2 }}
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                  </motion.a>
                );
              })}
            </div>
            <p className="text-gray-400 text-sm">
              {contactData.contact.email}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm" suppressHydrationWarning>
            © {new Date().getFullYear()} Loic Mazagran. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
