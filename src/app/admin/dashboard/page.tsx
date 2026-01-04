'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  HiVideoCamera,
  HiPhotograph,
  HiUser,
  HiMail,
  HiArrowRight,
  HiRefresh,
} from 'react-icons/hi';
import { authenticatedFetch } from '@/lib/client-api-helpers';

interface Stats {
  videos: number;
  photos: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ videos: 0, photos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [videosRes, photosRes] = await Promise.all([
        authenticatedFetch('/api/admin/videos'),
        authenticatedFetch('/api/admin/photos'),
      ]);

      const videosData = await videosRes.json();
      const photosData = await photosRes.json();

      setStats({
        videos: videosData.videos?.length || 0,
        photos: photosData.photos?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    {
      href: '/admin/videos',
      label: 'Gérer les vidéos',
      icon: HiVideoCamera,
      color: 'bg-blue-500/10 text-blue-500',
      description: `${stats.videos} vidéos`,
    },
    {
      href: '/admin/photos',
      label: 'Gérer les photos',
      icon: HiPhotograph,
      color: 'bg-green-500/10 text-green-500',
      description: `${stats.photos} photos`,
    },
    {
      href: '/admin/about',
      label: 'Modifier le profil',
      icon: HiUser,
      color: 'bg-purple-500/10 text-purple-500',
      description: 'Bio, compétences, récompenses',
    },
    {
      href: '/admin/contact',
      label: 'Infos de contact',
      icon: HiMail,
      color: 'bg-orange-500/10 text-orange-500',
      description: 'Email, téléphone, réseaux',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Bienvenue sur votre panneau d&apos;administration</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={link.href}
                className="block bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-colors group"
              >
                <div className={`w-12 h-12 rounded-lg ${link.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold mb-1">{link.label}</h3>
                <p className="text-gray-500 text-sm mb-4">{link.description}</p>
                <div className="flex items-center text-primary-500 text-sm font-medium group-hover:gap-2 transition-all">
                  Accéder
                  <HiArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Guide rapide</h2>
        <div className="space-y-4 text-gray-400">
          <p>
            Bienvenue dans votre interface d&apos;administration. Vous pouvez gérer tout le contenu de votre portfolio depuis ce panneau :
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong className="text-white">Vidéos :</strong> Ajoutez, modifiez ou supprimez vos vidéos et courts-métrages.</li>
            <li><strong className="text-white">Photos :</strong> Gérez votre galerie de photographies.</li>
            <li><strong className="text-white">À propos :</strong> Mettez à jour votre bio, compétences et récompenses.</li>
            <li><strong className="text-white">Contact :</strong> Modifiez vos informations de contact et liens vers les réseaux sociaux.</li>
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            Les modifications sont automatiquement synchronisées avec votre site public.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
