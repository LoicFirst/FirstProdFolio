'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaInstagram, FaYoutube, FaVimeoV, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { HiMail, HiPhone, HiLocationMarker, HiGlobe } from 'react-icons/hi';
import ContactForm from '@/components/ContactForm';

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface ContactData {
  contact: {
    email: string;
    phone: string;
    location: string;
  };
  social: SocialLink[];
  availability: {
    status: string;
    message: string;
  };
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  instagram: FaInstagram,
  youtube: FaYoutube,
  vimeo: FaVimeoV,
  linkedin: FaLinkedinIn,
  twitter: FaTwitter,
};

export default function ContactPage() {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch contact data dynamically from API
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await fetch('/api/public/contact');
        const data = await response.json();
        setContactData(data);
      } catch (error) {
        console.error('Error fetching contact data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!contactData) {
    return (
      <div className="min-h-screen bg-black py-20 flex items-center justify-center">
        <p className="text-gray-500">Impossible de charger les données.</p>
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
            Me <span className="text-primary-500">Contacter</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Vous avez un projet en tête ? N&apos;hésitez pas à me contacter. 
            Je serai ravi de discuter de vos idées et de comment je peux vous aider à les réaliser.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Availability Status */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-green-400 font-medium">
                  {contactData.availability.message}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Je réponds généralement dans les 24 à 48 heures.
              </p>
            </div>

            {/* Contact Details */}
            <div className="bg-gray-900 rounded-2xl p-6 space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Informations de contact
              </h3>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center">
                  <HiMail className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Email</p>
                  <a 
                    href={`mailto:${contactData.contact.email}`}
                    className="text-white hover:text-primary-500 transition-colors"
                  >
                    {contactData.contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center">
                  <HiPhone className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Téléphone</p>
                  <a 
                    href={`tel:${contactData.contact.phone}`}
                    className="text-white hover:text-primary-500 transition-colors"
                  >
                    {contactData.contact.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-500/10 flex items-center justify-center">
                  <HiLocationMarker className="w-6 h-6 text-primary-500" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Localisation</p>
                  <p className="text-white">{contactData.contact.location}</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">
                Suivez-moi
              </h3>
              <div className="flex flex-wrap gap-4">
                {contactData.social.map((social) => {
                  const Icon = iconMap[social.icon] || HiGlobe;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
                    >
                      {Icon && (
                        <Icon className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                      )}
                      <span className="text-gray-300 group-hover:text-white transition-colors">
                        {social.name}
                      </span>
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900 rounded-2xl p-8"
          >
            <h3 className="text-xl font-semibold text-white mb-6">
              Envoyez-moi un message
            </h3>
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
