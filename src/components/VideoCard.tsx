'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiPlay, HiX } from 'react-icons/hi';
import { Video } from '@/types';

interface VideoCardProps {
  video: Video;
  index: number;
}

// Extract YouTube video ID from URL
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Simple color generation based on seed
function generateColorsFromSeed(seed: string): string[] {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue1 = (hash * 137) % 360;
  const hue2 = (hue1 + 60) % 360;
  const hue3 = (hue1 + 180) % 360;
  
  return [
    `hsl(${hue1}, 70%, 50%)`,
    `hsl(${hue2}, 70%, 50%)`,
    `hsl(${hue3}, 70%, 50%)`,
  ];
}

export default function VideoCard({ video, index }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Generate ambilight colors based on video id
  const ambilightColors = useMemo(() => generateColorsFromSeed(video.id), [video.id]);

  const youtubeId = getYouTubeId(video.video_url);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="relative group"
      >
        {/* Ambilight Effect */}
        <div
          className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-50 blur-2xl transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${ambilightColors.join(', ')})`
          }}
        />
        
        {/* Card */}
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden cursor-pointer transform transition-transform duration-300 group-hover:scale-[1.02]">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gray-800">
            <div 
              className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center"
            >
              <div className="text-gray-500 text-lg font-medium">{video.title}</div>
            </div>
            
            {/* Play Button Overlay */}
            <div 
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center"
              >
                <HiPlay className="w-8 h-8 text-white ml-1" />
              </motion.div>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded text-white text-xs">
              {video.duration}
            </div>

            {/* Category Badge */}
            <div className="absolute top-3 left-3 px-3 py-1 bg-primary-500/90 rounded-full text-white text-xs font-medium">
              {video.category}
            </div>
          </div>

          {/* Info */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white group-hover:text-primary-500 transition-colors">
                {video.title}
              </h3>
              <span className="text-gray-500 text-sm">{video.year}</span>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">
              {video.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Video Player Modal */}
      {isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsPlaying(false)}
        >
          <button
            onClick={() => setIsPlaying(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-white hover:bg-gray-700 transition-colors z-10"
          >
            <HiX className="w-6 h-6" />
          </button>

          {/* Ambilight background for video */}
          <div
            className="absolute inset-0 opacity-30 blur-3xl"
            style={{
              background: `radial-gradient(ellipse at center, ${ambilightColors[0]} 0%, transparent 70%)`
            }}
          />

          <div 
            className="relative w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            {youtubeId ? (
              <iframe
                className="w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                className="w-full h-full rounded-lg"
                src={video.video_url}
                controls
                autoPlay
              />
            )}
          </div>
        </motion.div>
      )}
    </>
  );
}
