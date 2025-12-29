import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Edit, Trash2, Plus, ArrowLeft, TrendingUp, BarChart3 } from 'lucide-react';
import { useAuth, useFirebase, useModal, useInteraction } from '@/context';



import OctoDetailModal from '../components/modals/OctoDetailModal';
import { Octo } from '@/types';
import { formatDate } from '@/utils';

interface MyOctosPageProps {
  onBack: () => void;
}

const MyOctosPage: React.FC<MyOctosPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { getOctos, updateOcto, deleteOcto } = useFirebase();
  const { openDetailModal } = useModal();
  const { getOctoStats } = useInteraction();
  const [myOctos, setMyOctos] = useState<Octo[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    loadMyOctos();
  }, [user]);

  const loadMyOctos = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const allOctos = await getOctos();
      const userOctos = allOctos.filter(octo => octo.authorId === user.id);
      
      // Enrichir avec les statistiques
      const enrichedOctos = await Promise.all(
        userOctos.map(async (octo) => {
          const stats = await getOctoStats(octo.id);
          return {
            ...octo,
            stats: stats ? {
              views: stats.views,
              clicks: stats.clicks,
              likes: stats.likes,
              downloads: stats.downloads,
              score: stats.score,
              trending: stats.trending
            } : {
              views: 0,
              clicks: 0,
              likes: 0,
              downloads: 0,
              score: 0,
              trending: false
            }
          };
        })
      );
      
      setMyOctos(enrichedOctos);
    } catch (error) {
      console.error('Error loading octos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (octo: Octo) => {
    try {
      setUpdating(octo.id);
      await updateOcto(octo.id, { 
        isPublic: !octo.isPublic,
        updatedAt: new Date().toISOString()
      });
      await loadMyOctos();
    } catch (error) {
      console.error('Error during update:', error);
      alert('Error updating visibility');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (octo: Octo) => {
    if (!confirm('Are you sure you want to delete this octo?')) return;
    
    try {
      setDeleting(octo.id);
      await deleteOcto(octo.id);
      await loadMyOctos();
    } catch (error) {
      console.error('Error during deletion:', error);
      alert('Error during deletion');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (octo: Octo) => {
    openDetailModal(octo, {
      startInEditMode: true,
      onSaveCallback: loadMyOctos
    });
  };

  const filteredOctos = myOctos.filter(octo => {
    if (filter === 'public') return octo.isPublic;
    if (filter === 'private') return !octo.isPublic;
    return true;
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">You must be logged in to view this page</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4">
            <motion.button
              onClick={onBack}
              className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-heading font-bold text-gray-800">My Octos</h1>
              <p className="text-gray-600">Manage your data sources</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-md p-1">
            {[
              { key: 'all', label: 'All', count: myOctos.length },
              { key: 'public', label: 'Public', count: myOctos.filter(o => o.isPublic).length },
              { key: 'private', label: 'Private', count: myOctos.filter(o => !o.isPublic).length }
            ].map(({ key, label, count }) => (
              <motion.button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === key
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {label} ({count})
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOctos.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {filter === 'all' ? 'No octos found' : 
               filter === 'public' ? 'No public octos' : 'No private octos'}
            </h3>
            <p className="text-gray-600 mb-6">
              Start by adding your first data source
            </p>
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-5 w-5" />
              Add octo
            </motion.button>
          </motion.div>
        )}

        {/* Octos Grid */}
        {!loading && filteredOctos.length > 0 && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredOctos.map((octo, index) => (
              <motion.div
                key={octo.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                        {octo.title}
                        {octo.stats?.trending && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          octo.isPublic 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {octo.isPublic ? 'Public' : 'Private'}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {octo.format}
                        </span>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => toggleVisibility(octo)}
                      className={`p-2 rounded-lg transition-colors ${
                        updating === octo.id
                          ? 'text-gray-400 cursor-not-allowed'
                          : octo.isPublic 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      whileHover={updating === octo.id ? undefined : { scale: 1.1 }}
                      whileTap={updating === octo.id ? undefined : { scale: 0.9 }}
                     title={octo.isPublic ? 'Make private' : 'Make public'}
                      disabled={updating === octo.id}
                    >
                      {updating === octo.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      ) : octo.isPublic ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  {/* Statistics */}
                  {octo.stats && (
                    <div className="grid grid-cols-4 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{octo.stats.views}</div>
                        <div className="text-xs text-gray-600">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{octo.stats.clicks}</div>
                        <div className="text-xs text-gray-600">Clicks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{octo.stats.likes}</div>
                        <div className="text-xs text-gray-600">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{octo.stats.downloads}</div>
                        <div className="text-xs text-gray-600">Downloads</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Score */}
                  {octo.stats && octo.stats.score > 0 && (
                    <div className="flex items-center justify-center mb-3 p-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
                      <BarChart3 className="h-4 w-4 text-primary-600 mr-2" />
                      <span className="text-sm font-semibold text-primary-700">
                        Score: {octo.stats.score}
                      </span>
                    </div>
                  )}

                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {octo.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {octo.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {octo.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{octo.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Created on {formatDate(octo.createdAt)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => handleEdit(octo)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(octo)}
                      disabled={deleting === octo.id}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={deleting === octo.id ? undefined : { scale: 1.02 }}
                      whileTap={deleting === octo.id ? undefined : { scale: 0.98 }}
                    >
                      {deleting === octo.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Modal pour cette page */}
      <OctoDetailModal />
    </div>
  );
};

export default MyOctosPage;