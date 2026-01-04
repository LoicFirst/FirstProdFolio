'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiArrowRight, HiPlay, HiPhotograph } from 'react-icons/hi';
import FeaturedContent from '@/components/FeaturedContent';
import ClientReviews from '@/components/ClientReviews';
import videosData from '@/data/videos.json';
import photosData from '@/data/photos.json';
import themeData from '@/data/theme.json';

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient Animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 30% 20%, rgba(52, 152, 219, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(46, 204, 113, 0.1) 0%, transparent 50%)',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block px-4 py-2 mb-6 text-sm font-medium text-primary-500 bg-primary-500/10 rounded-full border border-primary-500/20">
              Bienvenue sur mon portfolio
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            <span className="text-white">{themeData.site.name}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 mb-4"
          >
            {themeData.site.title}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto"
          >
            {themeData.site.tagline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/videos">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-2 px-8 py-4 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-colors"
              >
                <HiPlay className="w-5 h-5" />
                Voir mes vidéos
                <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <Link href="/photos">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-2 px-8 py-4 border border-gray-600 text-white rounded-full font-semibold hover:border-primary-500 hover:text-primary-500 transition-colors"
              >
                <HiPhotograph className="w-5 h-5" />
                Galerie photos
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-3 bg-gray-600 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Content Section */}
      <FeaturedContent videos={videosData.videos} photos={photosData.photos} />

      {/* Client Reviews Section */}
      <ClientReviews />

      {/* About Teaser */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                À propos de <span className="text-primary-500">moi</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Réalisateur et monteur avec plus de 5 ans d&apos;expérience dans la création de 
                courts-métrages et contenus artistiques. Passionné par le cinéma depuis mon 
                plus jeune âge, j&apos;ai développé un style visuel unique qui mêle narration 
                émotionnelle et esthétique soignée.
              </p>
              <Link href="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 text-primary-500 font-medium hover:text-primary-400 transition-colors"
                >
                  En savoir plus
                  <HiArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <HiPhotograph className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Photo de profil</p>
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full border-2 border-primary-500/30 rounded-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Un projet en tête ?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Je suis disponible pour de nouveaux projets créatifs. 
              N&apos;hésitez pas à me contacter pour discuter de vos idées.
            </p>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-colors"
              >
                Me contacter
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
