import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Calendar, Tag, Database, GitMerge, Trash2, Edit } from 'lucide-react';
import { useModal } from '../../context/ModalContext';
import { useFirebase } from '../../context/FirebaseContext';
import { doc, deleteDoc } from 'firebase/firestore';
import { useHive } from '../../context/HiveContext';
import { useAuth } from '../../context/AuthContext';
import { useInteraction } from '../../context/InteractionContext';
import { formatDate } from '../../utils/dateUtils';
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
  }, [detailModalOptions.startInEditMode]);

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
          } catch (error) {
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: 'radial-gradient(circle at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col relative"
            style={{
              boxShadow: '0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
          >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-primary-50/10 pointer-events-none rounded-2xl"></div>
            
            {/* Header */}
            <motion.div 
              className="relative bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white p-6 rounded-t-2xl"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(255,193,7,0.3)'
              }}
            >
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-2xl"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-300 via-white/50 to-primary-300"></div>
              
              <motion.button
                onClick={closeDetailModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-all duration-200 group"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                <X className="h-5 w-5 group-hover:text-primary-100 transition-colors" />
              </motion.button>
              
              <div className="pr-12">
                <motion.h2 
                  className="font-heading font-bold text-2xl mb-2 drop-shadow-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {detailModalOcto.title}
                </motion.h2>
                <motion.div 
                  className="flex items-center space-x-3 text-primary-100"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    {detailModalOcto.format}
                  </span>
                  <span>•</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    {detailModalOcto.access}
                  </span>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Content */}
            <motion.div 
              className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
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
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">Description</h3>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                      {detailModalOcto.description}
                    </p>
                  </motion.div>
                  
                  {/* Tags */}
                  <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center mb-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg mr-3">
                        <Tag className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="font-heading font-semibold text-lg text-gray-800">Tags</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {detailModalOcto.tags.map((tag, index) => (
                        <motion.span
                          key={tag}
                          className="px-4 py-2 bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 rounded-xl text-sm font-medium border border-primary-300 shadow-sm"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          style={{
                            boxShadow: '0 2px 8px rgba(255, 193, 7, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                          }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Details Grid */}
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    {/* Format */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 shadow-lg mr-3">
                          <Database className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-heading font-semibold text-sm text-gray-800">Format</h3>
                      </div>
                      <p className="text-gray-700 font-medium text-lg">{detailModalOcto.format}</p>
                    </div>
                    
                    {/* Access Type */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center mb-2">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg mr-3">
                          <GitMerge className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-heading font-semibold text-sm text-gray-800">Access Type</h3>
                      </div>
                      <p className="text-gray-700 font-medium text-lg">{detailModalOcto.access}</p>
                    </div>
                    
                    {/* Added Date */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 shadow-sm md:col-span-2">
                      <div className="flex items-center mb-2">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg mr-3">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-heading font-semibold text-sm text-gray-800">Added on</h3>
                      </div>
                      <p className="text-gray-700 font-medium text-lg">{formatDate(detailModalOcto.addedAt)}</p>
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>
            
            {/* Footer */}
            {!isEditing && (
              <motion.div 
                className="border-t border-gray-200 p-6 bg-gradient-to-r from-gray-50 to-gray-100 space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <motion.a
                  href={detailModalOcto.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackInteraction(detailModalOcto.id, 'click', { source: 'detail_modal_link' })}
                  className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-4 px-6 rounded-xl transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: '0 8px 20px rgba(255, 193, 7, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <span>Accéder à la source</span>
                  <span>Access source</span>
                  <ExternalLink className="h-5 w-5" />
                </motion.a>
                
                {/* Download Button */}
                <motion.button
                  onClick={() => {
                    trackInteraction(detailModalOcto.id, 'download', { source: 'detail_modal' });
                    // Ici on pourrait implémenter la logique de téléchargement
                    window.open(detailModalOcto.link, '_blank');
                  }}
                  className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    boxShadow: '0 6px 16px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <span>Download data</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </motion.button>
                
                {canModifyOcto && (
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleEdit}
                      className="flex items-center justify-center gap-2 flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center justify-center gap-2 flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-300 disabled:to-red-400 text-white py-3 px-4 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                      whileHover={!isDeleting ? { scale: 1.02, y: -2 } : undefined}
                      whileTap={!isDeleting ? { scale: 0.98 } : undefined}
                      style={{
                        boxShadow: isDeleting 
                          ? '0 4px 12px rgba(239, 68, 68, 0.2)' 
                          : '0 6px 16px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          <span>
                            {detailModalOcto.isNested && detailModalOcto.position === 0 
                              ? "Delete group" 
                              : "Delete"
                            }
                          </span>
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
                
                {!canModifyOcto && user && (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-500">
                      You cannot modify this octo as it belongs to another user.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OctoDetailModal;