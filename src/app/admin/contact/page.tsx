'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiSave,
  HiPlus,
  HiTrash,
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiGlobe,
} from 'react-icons/hi';
import {
  FaInstagram,
  FaYoutube,
  FaVimeoV,
  FaLinkedin,
  FaTwitter,
} from 'react-icons/fa';
import { authenticatedFetch } from '@/lib/client-api-helpers';
import { UI_ERROR_MESSAGES_FR } from '@/lib/error-messages';

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

const defaultContact: ContactData = {
  contact: {
    email: '',
    phone: '',
    location: '',
  },
  social: [],
  availability: {
    status: 'available',
    message: '',
  },
};

const socialIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  instagram: FaInstagram,
  youtube: FaYoutube,
  vimeo: FaVimeoV,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
};

const socialOptions = [
  { name: 'Instagram', icon: 'instagram' },
  { name: 'YouTube', icon: 'youtube' },
  { name: 'Vimeo', icon: 'vimeo' },
  { name: 'LinkedIn', icon: 'linkedin' },
  { name: 'Twitter', icon: 'twitter' },
];

export default function AdminContactPage() {
  const [data, setData] = useState<ContactData>(defaultContact);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch('/api/admin/contact');
      const result = await res.json();
      if (result.contact) {
        setData(result.contact);
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authenticatedFetch('/api/admin/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      const result = await res.json();
      
      if (res.ok) {
        alert(UI_ERROR_MESSAGES_FR.SAVE_SUCCESS);
      } else {
        // Check if it's a read-only filesystem error
        if (result.isReadOnly) {
          alert(UI_ERROR_MESSAGES_FR.READ_ONLY_FILESYSTEM);
        } else {
          alert(UI_ERROR_MESSAGES_FR.SAVE_ERROR(result.error || 'Erreur inconnue', result.details || ''));
        }
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert(UI_ERROR_MESSAGES_FR.GENERAL_ERROR);
    } finally {
      setSaving(false);
    }
  };

  const updateContact = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  };

  const updateAvailability = (field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      availability: { ...prev.availability, [field]: value },
    }));
  };

  const addSocialLink = () => {
    setData((prev) => ({
      ...prev,
      social: [...prev.social, { name: '', url: '', icon: 'instagram' }],
    }));
  };

  const updateSocialLink = (index: number, field: string, value: string) => {
    const newSocial = [...data.social];
    newSocial[index] = { ...newSocial[index], [field]: value };
    setData((prev) => ({ ...prev, social: newSocial }));
  };

  const removeSocialLink = (index: number) => {
    setData((prev) => ({
      ...prev,
      social: prev.social.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Contact</h1>
          <p className="text-gray-400 mt-1">Gérez vos informations de contact et réseaux sociaux</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiSave className="w-5 h-5" />
          )}
          Enregistrer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <HiMail className="w-5 h-5 text-primary-500" />
            Informations de contact
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <HiMail className="w-4 h-4" />
                  Email
                </div>
              </label>
              <input
                type="email"
                value={data.contact.email}
                onChange={(e) => updateContact('email', e.target.value)}
                placeholder="contact@example.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <HiPhone className="w-4 h-4" />
                  Téléphone
                </div>
              </label>
              <input
                type="tel"
                value={data.contact.phone}
                onChange={(e) => updateContact('phone', e.target.value)}
                placeholder="+33 6 XX XX XX XX"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <HiLocationMarker className="w-4 h-4" />
                  Localisation
                </div>
              </label>
              <input
                type="text"
                value={data.contact.location}
                onChange={(e) => updateContact('location', e.target.value)}
                placeholder="Paris, France"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Availability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <HiGlobe className="w-5 h-5 text-primary-500" />
            Disponibilité
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
              <select
                value={data.availability.status}
                onChange={(e) => updateAvailability('status', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
              >
                <option value="available">Disponible</option>
                <option value="busy">Occupé</option>
                <option value="unavailable">Non disponible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <input
                type="text"
                value={data.availability.message}
                onChange={(e) => updateAvailability('message', e.target.value)}
                placeholder="Disponible pour de nouveaux projets"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <HiGlobe className="w-5 h-5 text-primary-500" />
            Réseaux sociaux
          </h2>
          <button
            onClick={addSocialLink}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <HiPlus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="space-y-3">
          {data.social.map((link, index) => {
            const Icon = socialIcons[link.icon] || HiGlobe;
            return (
              <div key={index} className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary-500" />
                </div>
                <select
                  value={link.icon}
                  onChange={(e) => {
                    const option = socialOptions.find((o) => o.icon === e.target.value);
                    updateSocialLink(index, 'icon', e.target.value);
                    if (option) updateSocialLink(index, 'name', option.name);
                  }}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                >
                  {socialOptions.map((option) => (
                    <option key={option.icon} value={option.icon}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                />
                <button
                  onClick={() => removeSocialLink(index)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <HiTrash className="w-5 h-5" />
                </button>
              </div>
            );
          })}
          {data.social.length === 0 && (
            <p className="text-center text-gray-500 py-8">Aucun réseau social ajouté</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
