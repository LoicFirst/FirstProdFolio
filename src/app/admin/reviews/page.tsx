'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiCheck,
  HiX,
  HiTrash,
  HiSearch,
  HiFilter,
  HiRefresh,
  HiStar,
  HiChatAlt2,
  HiUser,
} from 'react-icons/hi';
import { authenticatedFetch } from '@/lib/client-api-helpers';

interface Review {
  id: string;
  name: string;
  profession: string;
  photo_url?: string;
  review_text: string;
  rating?: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, totalCount: 0, totalPages: 0, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  const fetchReviews = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const res = await authenticatedFetch(`/api/admin/reviews?${params.toString()}`);
      const data = await res.json();
      
      setReviews(data.reviews || []);
      setStats(data.stats || { pending: 0, approved: 0, rejected: 0, total: 0 });
      setPagination(data.pagination || { page: 1, limit: 20, totalCount: 0, totalPages: 0, hasMore: false });
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleStatusChange = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const res = await authenticatedFetch('/api/admin/reviews', {
        method: 'PUT',
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        await fetchReviews(pagination.page);
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Une erreur est survenue');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;

    try {
      const res = await authenticatedFetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchReviews(pagination.page);
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Une erreur est survenue');
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedReviews.length === 0) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir ${action === 'approve' ? 'approuver' : 'rejeter'} ${selectedReviews.length} avis ?`)) return;

    try {
      const res = await authenticatedFetch('/api/admin/reviews', {
        method: 'POST',
        body: JSON.stringify({ action, ids: selectedReviews }),
      });

      if (res.ok) {
        setSelectedReviews([]);
        await fetchReviews(pagination.page);
      } else {
        alert('Erreur lors de l\'action en masse');
      }
    } catch (error) {
      console.error('Error bulk action:', error);
      alert('Une erreur est survenue');
    }
  };

  const toggleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map(r => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedReviews(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      approved: 'bg-green-500/20 text-green-500',
      rejected: 'bg-red-500/20 text-red-500',
    };
    const labels = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Avis Clients</h1>
          <p className="text-gray-400 mt-1">Gérez les avis soumis par vos clients</p>
        </div>
        <button
          onClick={() => fetchReviews(pagination.page)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <HiRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <HiChatAlt2 className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
              <p className="text-xs text-gray-500">En attente</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <HiCheck className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.approved}</p>
              <p className="text-xs text-gray-500">Approuvés</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
              <HiX className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.rejected}</p>
              <p className="text-xs text-gray-500">Rejetés</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
              <HiStar className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher par nom ou profession..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchReviews()}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <HiFilter className="w-5 h-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="approved">Approuvés</option>
            <option value="rejected">Rejetés</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg"
        >
          <span className="text-gray-400">{selectedReviews.length} avis sélectionné(s)</span>
          <div className="flex-1" />
          <button
            onClick={() => handleBulkAction('approve')}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
          >
            <HiCheck className="w-4 h-4" />
            Approuver
          </button>
          <button
            onClick={() => handleBulkAction('reject')}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <HiX className="w-4 h-4" />
            Rejeter
          </button>
        </motion.div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-xl">
          <HiChatAlt2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Aucun avis pour le moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-3 px-4">
            <input
              type="checkbox"
              checked={selectedReviews.length === reviews.length && reviews.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-primary-500 bg-gray-800 border-gray-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-400">Tout sélectionner</span>
          </div>

          <AnimatePresence>
            {reviews.map((review) => (
              <motion.div
                key={review.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gray-900 rounded-xl overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedReviews.includes(review.id)}
                      onChange={() => toggleSelect(review.id)}
                      className="mt-1 w-4 h-4 text-primary-500 bg-gray-800 border-gray-600 rounded focus:ring-primary-500"
                    />

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {review.photo_url ? (
                        <div
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${review.photo_url})` }}
                        />
                      ) : (
                        <HiUser className="w-6 h-6 text-gray-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-white font-medium">{review.name}</h3>
                        {getStatusBadge(review.status)}
                      </div>
                      <p className="text-sm text-primary-500 mb-2">{review.profession}</p>
                      
                      {/* Rating */}
                      {review.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <HiStar
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating! ? 'text-yellow-500' : 'text-gray-600'}`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Review Text */}
                      <p className={`text-gray-400 text-sm ${expandedReview !== review.id ? 'line-clamp-2' : ''}`}>
                        {review.review_text}
                      </p>
                      {review.review_text.length > 150 && (
                        <button
                          onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
                          className="text-primary-500 text-sm mt-1 hover:text-primary-400"
                        >
                          {expandedReview === review.id ? 'Voir moins' : 'Voir plus'}
                        </button>
                      )}

                      {/* Date */}
                      <p className="text-xs text-gray-600 mt-2">{formatDate(review.created_at)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(review.id, 'approved')}
                            className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors"
                            title="Approuver"
                          >
                            <HiCheck className="w-5 h-5 text-green-500" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(review.id, 'rejected')}
                            className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                            title="Rejeter"
                          >
                            <HiX className="w-5 h-5 text-red-500" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                        title="Supprimer"
                      >
                        <HiTrash className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => fetchReviews(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="text-gray-400">
                Page {pagination.page} sur {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchReviews(pagination.page + 1)}
                disabled={!pagination.hasMore}
                className="px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
