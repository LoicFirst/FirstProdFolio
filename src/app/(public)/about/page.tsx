'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiCode, HiFilm, HiPhotograph } from 'react-icons/hi';

interface Skill {
  category: string;
  items: string[];
}

interface Software {
  name: string;
  level: number;
  icon?: string;
}

interface Achievement {
  year: number;
  title: string;
  event: string;
}

interface AboutData {
  profile: {
    name: string;
    title: string;
    bio: string;
    photo_url?: string;
    experience_years: number;
    location: string;
  };
  skills: Skill[];
  software: Software[];
  achievements: Achievement[];
}

const categoryIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'Réalisation': HiFilm,
  'Post-production': HiCode,
  'Photographie': HiPhotograph,
  'Technique': HiAcademicCap,
};

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch about data dynamically from API
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const response = await fetch('/api/public/about');
        const data = await response.json();
        setAboutData(data);
      } catch (error) {
        console.error('Error fetching about data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!aboutData) {
    return (
      <div className="min-h-screen bg-black py-20 flex items-center justify-center">
        <p className="text-gray-500">Impossible de charger les données.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-20">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Profile Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
                <div className="text-center text-gray-500">
                  <HiPhotograph className="w-20 h-20 mx-auto mb-4 opacity-50" />
                  <p>Photo de profil</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full border-2 border-primary-500/30 rounded-2xl" />
              <div className="absolute -z-20 -bottom-12 -right-12 w-full h-full border border-secondary-500/20 rounded-2xl" />
            </motion.div>

            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {aboutData.profile.name}
                </h1>
                <p className="text-xl text-primary-500">
                  {aboutData.profile.title}
                </p>
              </div>

              <p className="text-gray-400 text-lg leading-relaxed">
                {aboutData.profile.bio}
              </p>

              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-500">
                      {aboutData.profile.experience_years}+
                    </span>
                  </div>
                  <span className="text-gray-400">Années d&apos;expérience</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-secondary-500/10 flex items-center justify-center">
                    <span className="text-2xl">📍</span>
                  </div>
                  <span className="text-gray-400">{aboutData.profile.location}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white mb-12 text-center"
          >
            Mes <span className="text-primary-500">Compétences</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutData.skills.map((skill, index) => {
              const Icon = categoryIcons[skill.category] || HiCode;
              return (
                <motion.div
                  key={skill.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center mb-4 group-hover:bg-primary-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {skill.category}
                  </h3>
                  <ul className="space-y-2">
                    {skill.items.map((item) => (
                      <li key={item} className="text-gray-400 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Software Section */}
        <section className="mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white mb-12 text-center"
          >
            Logiciels <span className="text-primary-500">Maîtrisés</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {aboutData.software.map((soft, index) => (
              <motion.div
                key={soft.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-900 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">{soft.name}</span>
                  <span className="text-primary-500 text-sm">{soft.level}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${soft.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Achievements Section */}
        <section>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-white mb-12 text-center"
          >
            Récompenses & <span className="text-primary-500">Distinctions</span>
          </motion.h2>

          <div className="max-w-3xl mx-auto">
            {aboutData.achievements.map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-8 pb-8 border-l border-gray-800 last:pb-0"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-0 w-4 h-4 -translate-x-1/2 rounded-full bg-primary-500" />
                
                <div className="bg-gray-900 rounded-xl p-6">
                  <span className="text-primary-500 text-sm font-medium">
                    {achievement.year}
                  </span>
                  <h3 className="text-white font-semibold text-lg mt-1">
                    {achievement.title}
                  </h3>
                  <p className="text-gray-400 mt-1">
                    {achievement.event}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
