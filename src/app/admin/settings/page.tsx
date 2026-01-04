'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiCog,
  HiSparkles,
  HiChatAlt2,
  HiSave,
  HiRefresh,
} from 'react-icons/hi';
import { authenticatedFetch } from '@/lib/client-api-helpers';
import { SiteSettings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    lightWaveEffect: true,
    reviewsEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaved(false);
      
      const res = await authenticatedFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Paramètres</h1>
          <p className="text-gray-400 mt-1">Configurez les options du site</p>
        </div>
        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Settings Cards */}
      <div className="space-y-4">
        {/* Light Wave Effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-xl p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <HiSparkles className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Effet de vague lumineuse</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Active l&apos;effet visuel de vague lumineuse qui suit le mouvement de la souris sur le site.
                  Cet effet crée une ambiance immersive et moderne.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.lightWaveEffect}
                onChange={(e) => setSettings({ ...settings, lightWaveEffect: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </motion.div>

        {/* Reviews Enabled */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-xl p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <HiChatAlt2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Avis clients</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Active ou désactive la possibilité pour les visiteurs de soumettre des avis.
                  Les avis existants resteront visibles même si cette option est désactivée.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reviewsEnabled}
                onChange={(e) => setSettings({ ...settings, reviewsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-end gap-4"
      >
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-green-500 text-sm"
          >
            ✓ Paramètres sauvegardés
          </motion.span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiSave className="w-5 h-5" />
          )}
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <HiCog className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">À propos des paramètres</h4>
            <p className="text-gray-400 text-sm">
              Ces paramètres affectent le comportement global du site. Les modifications sont appliquées
              immédiatement après la sauvegarde. Certains changements peuvent nécessiter un rafraîchissement
              de la page côté visiteur pour être visibles.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
