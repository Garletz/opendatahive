import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../../context/ModalContext';

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
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          background: 'radial-gradient(circle at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
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
            
            <motion.h2 
              className="font-heading font-bold text-2xl drop-shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {modal.title}
            </motion.h2>
          </motion.div>
          
          {/* Content */}
          <motion.div 
            className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#FFC107 #f1f5f9'
            }}
          >
            {modal.content}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Modal;