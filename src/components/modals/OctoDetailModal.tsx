import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Calendar, Tag, Database, GitMerge, Trash2, Edit } from 'lucide-react';
import { useModal, useFirebase, useHive, useAuth, useInteraction } from '@/context';
import { doc, deleteDoc } from 'firebase/firestore';
import { formatDate } from '@/utils';
import EditOctoForm from './EditOctoForm';

const OctoDetailModal: React.FC = () => {
  const { isDetailModalOpen, detailModalOcto, detailModalOptions, closeDetailModal } = useModal();
  const { deleteOcto, deleteNestedGroup, db } = useFirebase();
  const { refreshOctos } = useHive();
  const { user } = useAuth();
  const { trackInteraction } = useInteraction();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(detailModalOptions.startInEditMode || false);

  // Update editing state when modal options change
  React.useEffect(() => {
    setIsEditing(detailModalOptions.startInEditMode || false);

    // Enregistrer une vue détaillée quand le modal s'ouvre
    if (isDetailModalOpen && detailModalOcto) {
      trackInteraction(detailModalOcto.id, 'view', {
        source: 'detail_modal',
        duration: 0
      });
    }
  }, [detailModalOptions.startInEditMode, isDetailModalOpen, detailModalOcto]);

  // Vérifier si l'utilisateur peut modifier/supprimer cet octo
  const canModifyOcto = detailModalOcto && user && (
    detailModalOcto.authorId === user.id ||
    user.id === detailModalOcto.authorId
  );

  const handleDelete = async () => {
    if (!detailModalOcto || isDeleting || !canModifyOcto) {
      alert("You don't have permission to delete this octo.");
      return;
    }

    const confirmMessage = detailModalOcto.isNested && detailModalOcto.position === 0
      ? "Are you sure you want to delete this octo group? All octos in the group will be deleted."
      : "Are you sure you want to delete this octo?";

    if (!confirm(confirmMessage)) return;

    setIsDeleting(true);

    try {
      if (detailModalOcto.isNested && detailModalOcto.position === 0 && detailModalOcto.nestedGroupId) {
        await deleteNestedGroup(detailModalOcto.nestedGroupId);
      } else {
        await deleteOcto(detailModalOcto.id);
        // Supprimer également les statistiques de l'octo
        if (db) {
          try {
            await deleteDoc(doc(db, 'octoStats', detailModalOcto.id));
          } catch {
            console.log('No stats to delete for this octo');
          }
        }
      }

      await refreshOctos();
      closeDetailModal();
    } catch (error) {
      console.error('Error deleting octo:', error);
      alert('Error during deletion. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (!canModifyOcto) {
      alert("You don't have permission to modify this octo.");
      return;
    }
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    // Call the callback if provided
    if (detailModalOptions.onSaveCallback) {
      detailModalOptions.onSaveCallback();
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (!detailModalOcto) return null;

  return (
    <AnimatePresence>
      {isDetailModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col relative"
          >
            {/* Header */}
            <div className="relative bg-slate-900 border-b border-slate-800 p-6 rounded-t-2xl">
              <button
                onClick={closeDetailModal}
                className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="pr-12">
                <motion.h2
                  className="font-bold text-2xl mb-2 text-white"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {detailModalOcto.title}
                </motion.h2>
                <motion.div
                  className="flex items-center space-x-3 text-slate-400"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="px-2.5 py-1 bg-slate-800 rounded-md text-xs font-medium border border-slate-700 text-cyan-400">
                    {detailModalOcto.format}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="px-2.5 py-1 bg-slate-800 rounded-md text-xs font-medium border border-slate-700 text-cyan-400">
                    {detailModalOcto.access}
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-900 text-slate-300 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {isEditing ? (
                <EditOctoForm
                  octo={detailModalOcto}
                  onClose={handleCancelEdit}
                  onSave={handleSaveEdit}
                />
              ) : (
                <>
                  {/* Description */}
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="font-semibold text-slate-200 mb-3 text-sm uppercase tracking-wide">Description</h3>
                    <p className="text-slate-400 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                      {detailModalOcto.description}
                    </p>
                  </motion.div>

                  {/* Tags */}
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center mb-3">
                      <Tag className="h-4 w-4 text-cyan-500 mr-2" />
                      <h3 className="font-semibold text-sm text-slate-200 uppercase tracking-wide">Tags</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {detailModalOcto.tags.map((tag, index) => (
                        <span
                          key={tag}
                          className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium border border-slate-700 hover:border-cyan-500/50 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  {/* Details Grid */}
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {/* Format */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                      <div className="flex items-center mb-2">
                        <Database className="h-4 w-4 text-cyan-500 mr-2" />
                        <h3 className="font-semibold text-xs text-slate-400 uppercase">Format</h3>
                      </div>
                      <p className="text-slate-200 font-medium text-lg">{detailModalOcto.format}</p>
                    </div>

                    {/* Access Type */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                      <div className="flex items-center mb-2">
                        <GitMerge className="h-4 w-4 text-indigo-400 mr-2" />
                        <h3 className="font-semibold text-xs text-slate-400 uppercase">Access Type</h3>
                      </div>
                      <p className="text-slate-200 font-medium text-lg">{detailModalOcto.access}</p>
                    </div>

                    {/* Added Date */}
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors md:col-span-2">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 text-orange-400 mr-2" />
                        <h3 className="font-semibold text-xs text-slate-400 uppercase">Added on</h3>
                      </div>
                      <p className="text-slate-200 font-medium text-lg">{formatDate(detailModalOcto.addedAt)}</p>
                    </div>
                  </motion.div>
                </>
              )}
            </div>

            {/* Footer */}
            {!isEditing && (
              <div className="border-t border-slate-800 p-6 bg-slate-900 space-y-3">
                <a
                  href={detailModalOcto.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackInteraction(detailModalOcto.id, 'click', { source: 'detail_modal_link' })}
                  className="flex items-center justify-center gap-2 w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 px-6 rounded-xl transition-all duration-200 font-semibold shadow-lg shadow-cyan-900/20"
                >
                  <span>Access Data Source</span>
                  <ExternalLink className="h-4 w-4" />
                </a>

                {/* Download Button - Optional placeholder if needed, reused logic */}
                <button
                  onClick={() => {
                    trackInteraction(detailModalOcto.id, 'download', { source: 'detail_modal' });
                    window.open(detailModalOcto.link, '_blank');
                  }}
                  className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 px-6 rounded-xl transition-all duration-200 font-medium border border-slate-700"
                >
                  <span>Download Data</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>

                {canModifyOcto && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleEdit}
                      className="flex items-center justify-center gap-2 flex-1 bg-slate-800 hover:bg-slate-700 text-blue-400 py-3 px-4 rounded-xl transition-colors font-medium border border-slate-700"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center justify-center gap-2 flex-1 bg-slate-800 hover:bg-red-500/10 text-red-400 hover:text-red-300 py-3 px-4 rounded-xl transition-colors font-medium border border-slate-700 hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!canModifyOcto && user && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-600">
                      Read-only access
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OctoDetailModal;