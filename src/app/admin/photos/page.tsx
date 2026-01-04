'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiX,
  HiPhotograph,
  HiUpload,
} from 'react-icons/hi';
import { authenticatedFetch } from '@/lib/client-api-helpers';

interface Photo {
  id: string;
  title: string;
  description: string;
  year: number;
  image_url: string;
  thumbnail_url: string;
  category: string;
  location: string;
  isPublished?: boolean;
}

const initialFormData: Omit<Photo, 'id'> = {
  title: '',
  description: '',
  year: new Date().getFullYear(),
  image_url: '',
  thumbnail_url: '',
  category: '',
  location: '',
  isPublished: true,
};

const categories = [
  'Portrait',
  'Paysage',
  'Urbain',
  'Architecture',
  'Street Photography',
  'Still Life',
  'Behind the Scenes',
  'Nuit',
];

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch('/api/admin/photos');
      const data = await res.json();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'portfolio/photos');

      const res = await authenticatedFetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          image_url: data.url,
          thumbnail_url: data.url,
        }));
      } else {
        alert('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = '/api/admin/photos';
      const method = editingPhoto ? 'PUT' : 'POST';
      const body = editingPhoto
        ? { ...formData, id: editingPhoto.id }
        : formData;

      const res = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchPhotos();
        closeModal();
      } else {
        const error = await res.json();
        alert(error.error || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Error saving photo:', error);
      alert('Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return;

    try {
      const res = await authenticatedFetch(`/api/admin/photos?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchPhotos();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Une erreur est survenue');
    }
  };

  const openEditModal = (photo: Photo) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title,
      description: photo.description,
      year: photo.year,
      image_url: photo.image_url,
      thumbnail_url: photo.thumbnail_url,
      category: photo.category,
      location: photo.location,
      isPublished: photo.isPublished ?? true,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingPhoto(null);
    setFormData(initialFormData);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPhoto(null);
    setFormData(initialFormData);
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
          <h1 className="text-3xl font-bold text-white">Photos</h1>
          <p className="text-gray-400 mt-1">Gérez votre galerie de photographies</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <HiPlus className="w-5 h-5" />
          Ajouter une photo
        </button>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <HiPhotograph className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Aucune photo pour le moment</p>
            <button
              onClick={openAddModal}
              className="mt-4 text-primary-500 hover:text-primary-400"
            >
              Ajouter votre première photo
            </button>
          </div>
        ) : (
          photos.map((photo) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-xl overflow-hidden group"
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-800">
                {photo.image_url ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${photo.image_url})` }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <HiPhotograph className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openEditModal(photo)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <HiPencil className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <HiTrash className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="text-white text-sm font-medium line-clamp-1">{photo.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">{photo.year}</span>
                  <span className="text-xs text-primary-500">{photo.category}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-xl font-semibold text-white">
                  {editingPhoto ? 'Modifier la photo' : 'Nouvelle photo'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.image_url ? (
                      <div
                        className="w-24 h-24 rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${formData.image_url})` }}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gray-800 flex items-center justify-center">
                        <HiPhotograph className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors cursor-pointer">
                      <HiUpload className="w-5 h-5" />
                      {uploading ? 'Téléchargement...' : 'Télécharger'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Année *
                    </label>
                    <input
                      type="number"
                      required
                      min="1900"
                      max="2100"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Catégorie *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Sélectionner...</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Lieu *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Paris, France"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      URL de l&apos;image (optionnel)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.image_url}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        image_url: e.target.value,
                        thumbnail_url: e.target.value 
                      })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                        className="w-4 h-4 text-primary-500 bg-gray-800 border-gray-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-300">Publier sur le site</span>
                    </label>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {editingPhoto ? 'Enregistrer' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
