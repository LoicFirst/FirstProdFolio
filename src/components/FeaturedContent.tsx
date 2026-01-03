'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Video, Photo } from '@/types';
import { HiPlay, HiArrowRight } from 'react-icons/hi';

interface FeaturedContentProps {
  videos: Video[];
  photos: Photo[];
}

export default function FeaturedContent({ videos, photos }: FeaturedContentProps) {
  // Take 3 recent videos and 4 recent photos
  const featuredVideos = videos.slice(0, 3);
  const featuredPhotos = photos.slice(0, 4);

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Mes Dernières <span className="text-primary-500">Créations</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Découvrez une sélection de mes projets les plus récents en vidéo et photographie.
          </p>
        </motion.div>

        {/* Videos Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold text-white">Vidéos</h3>
            <Link href="/videos" className="text-primary-500 hover:text-primary-400 flex items-center gap-2 text-sm">
              Voir tout <HiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group relative bg-gray-900 rounded-xl overflow-hidden cursor-pointer"
              >
                <Link href="/videos">
                  <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <span className="text-gray-500">{video.title}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center">
                      <HiPlay className="w-7 h-7 text-white ml-1" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-white font-medium">{video.title}</h4>
                    <p className="text-gray-500 text-sm">{video.category} • {video.year}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Photos Grid */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold text-white">Photos</h3>
            <Link href="/photos" className="text-primary-500 hover:text-primary-400 flex items-center gap-2 text-sm">
              Voir tout <HiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="group relative rounded-xl overflow-hidden cursor-pointer aspect-square"
              >
                <Link href="/photos">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">{photo.title}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{photo.title}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
