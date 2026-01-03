'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import VideoCard from '@/components/VideoCard';
import videosData from '@/data/videos.json';

export default function VideosPage() {
  const [filter, setFilter] = useState<string>('all');
  
  // Get unique categories
  const categories = ['all', ...new Set(videosData.videos.map(v => v.category))];
  
  // Filter videos
  const filteredVideos = filter === 'all' 
    ? videosData.videos 
    : videosData.videos.filter(v => v.category === filter);

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
            Mes <span className="text-primary-500">Vidéos</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Découvrez mes courts-métrages, documentaires et projets vidéo. 
            Chaque création raconte une histoire unique.
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
              {category === 'all' ? 'Tous' : category}
            </button>
          ))}
        </motion.div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </div>

        {/* No Results */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Aucune vidéo trouvée dans cette catégorie.</p>
          </div>
        )}
      </div>
    </div>
  );
}
