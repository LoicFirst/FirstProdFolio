'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PhotoGallery from '@/components/PhotoGallery';

interface Photo {
  id: string;
  title: string;
  description: string;
  year: number;
  image_url: string;
  thumbnail_url: string;
  category: string;
  location: string;
  isPublished?: boolean;
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  
  // Fetch photos dynamically from API
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/public/photos');
        const data = await response.json();
        // Filter out unpublished photos
        const publishedPhotos = (data.photos || []).filter((p: Photo) => p.isPublished !== false);
        setPhotos(publishedPhotos);
      } catch (error) {
        console.error('Error fetching photos:', error);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, []);
  
  // Get unique categories
  const categories = ['all', ...new Set(photos.map(p => p.category))];
  
  // Filter photos
  const filteredPhotos = filter === 'all' 
    ? photos 
    : photos.filter(p => p.category === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
