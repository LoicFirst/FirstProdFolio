'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiSave,
  HiPlus,
  HiTrash,
  HiAcademicCap,
} from 'react-icons/hi';
import { authenticatedFetch } from '@/lib/client-api-helpers';
import { UI_ERROR_MESSAGES_FR } from '@/lib/error-messages';

interface Skill {
  category: string;
  items: string[];
}

interface Software {
  name: string;
  level: number;
  icon: string;
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
    photo_url: string;
    experience_years: number;
    location: string;
  };
  skills: Skill[];
  software: Software[];
  achievements: Achievement[];
}

const defaultAbout: AboutData = {
  profile: {
    name: '',
    title: '',
    bio: '',
    photo_url: '',
    experience_years: 0,
    location: '',
  },
  skills: [],
  software: [],
  achievements: [],
};

export default function AdminAboutPage() {
  const [data, setData] = useState<AboutData>(defaultAbout);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'software' | 'achievements'>('profile');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch('/api/admin/about');
      const result = await res.json();
      if (result.about) {
        setData(result.about);
      }
    } catch (error) {
      console.error('Error fetching about:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await authenticatedFetch('/api/admin/about', {
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

  // Profile update
  const updateProfile = (field: string, value: string | number) => {
    setData((prev) => ({
      ...prev,
      profile: { ...prev.profile, [field]: value },
    }));
  };

  // Skills management
  const addSkill = () => {
    setData((prev) => ({
      ...prev,
      skills: [...prev.skills, { category: '', items: [] }],
    }));
  };

  const updateSkill = (index: number, field: string, value: string | string[]) => {
    const newSkills = [...data.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setData((prev) => ({ ...prev, skills: newSkills }));
  };

  const removeSkill = (index: number) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // Software management
  const addSoftware = () => {
    setData((prev) => ({
      ...prev,
      software: [...prev.software, { name: '', level: 50, icon: '' }],
    }));
  };

  const updateSoftware = (index: number, field: string, value: string | number) => {
    const newSoftware = [...data.software];
    newSoftware[index] = { ...newSoftware[index], [field]: value };
    setData((prev) => ({ ...prev, software: newSoftware }));
  };

  const removeSoftware = (index: number) => {
    setData((prev) => ({
      ...prev,
      software: prev.software.filter((_, i) => i !== index),
    }));
  };

  // Achievements management
  const addAchievement = () => {
    setData((prev) => ({
      ...prev,
      achievements: [...prev.achievements, { year: new Date().getFullYear(), title: '', event: '' }],
    }));
  };

  const updateAchievement = (index: number, field: string, value: string | number) => {
    const newAchievements = [...data.achievements];
    newAchievements[index] = { ...newAchievements[index], [field]: value };
    setData((prev) => ({ ...prev, achievements: newAchievements }));
  };

  const removeAchievement = (index: number) => {
    setData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profil' },
    { id: 'skills', label: 'Compétences' },
    { id: 'software', label: 'Logiciels' },
    { id: 'achievements', label: 'Récompenses' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">À propos</h1>
          <p className="text-gray-400 mt-1">Gérez votre profil, compétences et récompenses</p>
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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-xl p-6"
      >
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                <input
                  type="text"
                  value={data.profile.name}
                  onChange={(e) => updateProfile('name', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
                <input
                  type="text"
                  value={data.profile.title}
                  onChange={(e) => updateProfile('title', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Années d&apos;expérience</label>
                <input
                  type="number"
                  min="0"
                  value={data.profile.experience_years}
                  onChange={(e) => updateProfile('experience_years', parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Localisation</label>
                <input
                  type="text"
                  value={data.profile.location}
                  onChange={(e) => updateProfile('location', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">URL de la photo</label>
                <input
                  type="url"
                  value={data.profile.photo_url}
                  onChange={(e) => updateProfile('photo_url', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Biographie</label>
                <textarea
                  rows={5}
                  value={data.profile.bio}
                  onChange={(e) => updateProfile('bio', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={addSkill}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <HiPlus className="w-4 h-4" />
                Ajouter une catégorie
              </button>
            </div>
            {data.skills.map((skill, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Nom de la catégorie"
                    value={skill.category}
                    onChange={(e) => updateSkill(index, 'category', e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                  <button
                    onClick={() => removeSkill(index)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Compétences (séparées par des virgules)</label>
                  <input
                    type="text"
                    placeholder="Compétence 1, Compétence 2, ..."
                    value={skill.items.join(', ')}
                    onChange={(e) => updateSkill(index, 'items', e.target.value.split(',').map((s) => s.trim()))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            ))}
            {data.skills.length === 0 && (
              <p className="text-center text-gray-500 py-8">Aucune compétence ajoutée</p>
            )}
          </div>
        )}

        {activeTab === 'software' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={addSoftware}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <HiPlus className="w-4 h-4" />
                Ajouter un logiciel
              </button>
            </div>
            {data.software.map((soft, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Nom du logiciel"
                    value={soft.name}
                    onChange={(e) => updateSoftware(index, 'name', e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Icône"
                    value={soft.icon}
                    onChange={(e) => updateSoftware(index, 'icon', e.target.value)}
                    className="w-32 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  />
                  <div className="flex items-center gap-2 w-40">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={soft.level}
                      onChange={(e) => updateSoftware(index, 'level', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-primary-500 text-sm w-10">{soft.level}%</span>
                  </div>
                  <button
                    onClick={() => removeSoftware(index)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {data.software.length === 0 && (
              <p className="text-center text-gray-500 py-8">Aucun logiciel ajouté</p>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={addAchievement}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <HiPlus className="w-4 h-4" />
                Ajouter une récompense
              </button>
            </div>
            {data.achievements.map((achievement, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                    <HiAcademicCap className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="number"
                      placeholder="Année"
                      min="1900"
                      max="2100"
                      value={achievement.year}
                      onChange={(e) => updateAchievement(index, 'year', parseInt(e.target.value) || new Date().getFullYear())}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Titre"
                      value={achievement.title}
                      onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Événement"
                      value={achievement.event}
                      onChange={(e) => updateAchievement(index, 'event', e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <button
                    onClick={() => removeAchievement(index)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {data.achievements.length === 0 && (
              <p className="text-center text-gray-500 py-8">Aucune récompense ajoutée</p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
