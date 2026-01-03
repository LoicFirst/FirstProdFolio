'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import PhotoGallery from '@/components/PhotoGallery';
import photosData from '@/data/photos.json';

export default function PhotosPage() {
  const [filter, setFilter] = useState<string>('all');
  
  // Get unique categories
  const categories = ['all', ...new Set(photosData.photos.map(p => p.category))];
  
  // Filter photos
  const filteredPhotos = filter === 'all' 
    ? photosData.photos 
    : photosData.photos.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-black py-20">
      <div className="container mx-auto px-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Galerie <span className="text-primary-500">Photos</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Une sélection de mes travaux photographiques, 
            du portrait au paysage en passant par la photographie de rue.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                filter === category
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {category === 'all' ? 'Toutes' : category}
            </button>
          ))}
        </motion.div>

        {/* Photo Gallery */}
        <PhotoGallery photos={filteredPhotos} />

        {/* No Results */}
        {filteredPhotos.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Aucune photo trouvée dans cette catégorie.</p>
          </div>
        )}
      </div>
    </div>
  );
}
