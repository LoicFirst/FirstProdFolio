'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Photo } from '@/types';

interface PhotoGalleryProps {
  photos: Photo[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const slides = photos.map((photo) => ({
    src: photo.image_url,
    title: photo.title,
    description: photo.description,
  }));

  return (
    <>
      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="break-inside-avoid group cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <div className="relative overflow-hidden rounded-xl bg-gray-800">
              {/* Placeholder for image */}
              <div 
                className={`w-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center ${
                  index % 3 === 0 ? 'aspect-[4/5]' : index % 3 === 1 ? 'aspect-square' : 'aspect-[3/4]'
                }`}
              >
                <div className="text-center p-4">
                  <div className="text-gray-400 text-sm">{photo.title}</div>
                  <div className="text-gray-600 text-xs mt-1">{photo.category}</div>
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-semibold text-lg">{photo.title}</h3>
                <p className="text-gray-300 text-sm mt-1">{photo.category}</p>
                <p className="text-gray-400 text-xs mt-1">{photo.location} • {photo.year}</p>
              </div>

              {/* Zoom Icon */}
              <motion.div
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                className="absolute top-4 right-4 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={lightboxIndex}
        styles={{
          container: { backgroundColor: 'rgba(0, 0, 0, 0.95)' },
        }}
      />
    </>
  );
}
