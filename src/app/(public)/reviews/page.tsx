'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiUser, HiBriefcase, HiStar, HiCheck, HiExclamation } from 'react-icons/hi';

export default function ReviewsPage() {
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    review_text: '',
    rating: 5,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/public/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: '', profession: '', review_text: '', rating: 5 });
      } else {
        setError(data.error || 'Une erreur est survenue');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-black py-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiCheck className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Merci pour votre avis !</h2>
            <p className="text-gray-400 mb-6">
              Votre avis a été soumis avec succès. Il sera visible sur le site après validation par l&apos;administrateur.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Soumettre un autre avis
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-20">
      <div className="container mx-auto px-6 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Partagez votre <span className="text-primary-500">expérience</span>
          </h1>
          <p className="text-gray-400">
            Votre avis compte ! Partagez votre expérience de collaboration avec nous.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-2xl p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3"
            >
              <HiExclamation className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <HiUser className="inline w-4 h-4 mr-2" />
                Nom complet *
              </label>
              <input
                type="text"
                required
                placeholder="Jean Dupont"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <HiBriefcase className="inline w-4 h-4 mr-2" />
                Profession *
              </label>
              <input
                type="text"
                required
                placeholder="Directeur artistique"
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <HiStar className="inline w-4 h-4 mr-2" />
                Note
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <HiStar
                      className={`w-8 h-8 transition-colors ${
                        star <= formData.rating ? 'text-yellow-500' : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-gray-400 text-sm">{formData.rating}/5</span>
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Votre avis *
              </label>
              <textarea
                required
                rows={5}
                placeholder="Partagez votre expérience de collaboration..."
                minLength={10}
                maxLength={2000}
                value={formData.review_text}
                onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors resize-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                {formData.review_text.length}/2000 caractères (minimum 10)
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Soumettre mon avis'
              )}
            </button>

            <p className="text-gray-500 text-sm text-center">
              Votre avis sera visible après validation par l&apos;administrateur.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
