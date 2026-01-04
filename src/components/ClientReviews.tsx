'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { HiStar, HiUser, HiArrowRight, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface Review {
  id: string;
  name: string;
  profession: string;
  photo_url?: string;
  review_text: string;
  rating?: number;
  created_at: string;
}

// Sample reviews to display when no real reviews exist (static dates to avoid re-renders)
const SAMPLE_REVIEWS: Review[] = [
  {
    id: 'sample-1',
    name: 'Marie Dubois',
    profession: 'Directrice Marketing',
    review_text: 'Une collaboration exceptionnelle ! Loic a su capturer parfaitement l\'essence de notre marque dans une vidéo promotionnelle qui a dépassé toutes nos attentes.',
    rating: 5,
    created_at: '2024-12-15T10:00:00.000Z',
  },
  {
    id: 'sample-2',
    name: 'Thomas Laurent',
    profession: 'Réalisateur indépendant',
    review_text: 'Un talent rare pour la narration visuelle. Son travail de montage sur mon court-métrage a apporté une dimension émotionnelle que je n\'aurais pas pu imaginer.',
    rating: 5,
    created_at: '2024-11-20T14:30:00.000Z',
  },
  {
    id: 'sample-3',
    name: 'Sophie Martin',
    profession: 'Chef d\'entreprise',
    review_text: 'Professionnel, créatif et à l\'écoute. Les photos et vidéos de notre événement d\'entreprise étaient magnifiques. Je recommande vivement !',
    rating: 5,
    created_at: '2024-10-08T09:15:00.000Z',
  },
  {
    id: 'sample-4',
    name: 'Pierre Moreau',
    profession: 'Artiste musicien',
    review_text: 'Loic a réalisé mon clip musical avec une vision artistique impressionnante. Le résultat est au-delà de mes espérances.',
    rating: 5,
    created_at: '2024-09-25T16:45:00.000Z',
  },
  {
    id: 'sample-5',
    name: 'Émilie Rousseau',
    profession: 'Productrice',
    review_text: 'Un œil unique pour la composition et l\'éclairage. Chaque plan est pensé avec soin. Un plaisir de travailler avec lui.',
    rating: 5,
    created_at: '2024-08-12T11:20:00.000Z',
  },
  {
    id: 'sample-6',
    name: 'Antoine Bernard',
    profession: 'Entrepreneur',
    review_text: 'Rapidité d\'exécution, qualité irréprochable et communication fluide. Le partenaire idéal pour tous vos projets vidéo.',
    rating: 5,
    created_at: '2024-07-05T08:00:00.000Z',
  },
];

export default function ClientReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  // Auto-scroll reviews (respects reduced motion preference)
  useEffect(() => {
    if (!isAutoPlaying || reviews.length <= 3) return;
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % Math.ceil(reviews.length / 3));
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/public/reviews?limit=6');
      const data = await res.json();
      // Use sample reviews if no real reviews exist
      if (data.reviews && data.reviews.length > 0) {
        setReviews(data.reviews);
      } else {
        setReviews(SAMPLE_REVIEWS);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Use sample reviews on error
      setReviews(SAMPLE_REVIEWS);
    } finally {
      setLoading(false);
    }
  };

  // Show 3 reviews at a time on desktop, 1 on mobile
  const reviewsPerPage = 3;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const currentReviews = reviews.slice(
    currentPage * reviewsPerPage,
    (currentPage + 1) * reviewsPerPage
  );

  const nextPage = () => {
    setIsAutoPlaying(false);
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setIsAutoPlaying(false);
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Don't render if still loading
  if (loading) {
    return (
      <section className="py-20 bg-gray-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Nos <span className="text-primary-500">Clients</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Découvrez ce que nos clients pensent de notre collaboration.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-950">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Nos <span className="text-primary-500">Clients</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Découvrez ce que nos clients pensent de notre collaboration.
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="relative">
          {/* Navigation Arrows */}
          {totalPages > 1 && (
            <>
              <button
                onClick={prevPage}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors shadow-lg hidden md:flex"
                aria-label="Avis précédents"
              >
                <HiChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextPage}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors shadow-lg hidden md:flex"
                aria-label="Avis suivants"
              >
                <HiChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Reviews with animation */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {currentReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900 rounded-xl p-6"
                >
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {review.photo_url ? (
                        <Image
                          src={review.photo_url}
                          alt={`Photo de ${review.name}`}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <HiUser className="w-6 h-6 text-gray-600" aria-hidden="true" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{review.name}</h3>
                      <p className="text-primary-500 text-sm">{review.profession}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  {review.rating && (
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <HiStar
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating! ? 'text-yellow-500' : 'text-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Review Text */}
                  <p className="text-gray-400 text-sm line-clamp-4 leading-relaxed">
                    &ldquo;{review.review_text}&rdquo;
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentPage(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentPage ? 'bg-primary-500 w-4' : 'bg-gray-700'
                  }`}
                  aria-label={`Page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link href="/reviews">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 text-white rounded-full font-medium hover:border-primary-500 hover:text-primary-500 transition-colors"
            >
              Laisser un avis
              <HiArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
