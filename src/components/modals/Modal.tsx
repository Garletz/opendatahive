import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '@/context';
import { X } from 'lucide-react';

const Modal: React.FC = () => {
  const { modal, openModal } = useModal();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      openModal(null);
    }
  };

  if (!modal) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">
              {modal.title}
            </h2>
            <button
              onClick={() => openModal(null)}
              className="p-2 -mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 text-slate-300 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {modal.content}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Modal;