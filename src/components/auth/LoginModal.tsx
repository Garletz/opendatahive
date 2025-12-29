import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Github, UserX, Loader2 } from 'lucide-react';
import { useAuth } from '@/context';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGitHub, signInAnonymously, loading, error } = useAuth();

  const handleGitHubLogin = async () => {
    try {
      await signInWithGitHub();
      onClose();
    } catch (error) {
      console.error('Error during GitHub sign-in:', error);
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      console.log('Attempting anonymous sign-in...');
      await signInAnonymously();
      console.log('Connexion anonyme terminée avec succès');
      onClose();
    } catch (error) {
      console.error('Error in handleAnonymousLogin:', error);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative"
      >
        {/* Header */}
        <div className="bg-transparent p-6 border-b border-white/10 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="font-bold text-2xl text-white mb-2 tracking-tight">Sign In</h2>
          <p className="text-white/50 text-sm">
            Access your data intelligence dashboard
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <motion.div
              className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {/* GitHub Login */}
          <motion.button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white py-4 px-6 rounded-xl transition-all duration-200 font-medium shadow-sm border border-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white/50" />
            ) : (
              <Github className="h-5 w-5" />
            )}
            <span>Continue with GitHub</span>
          </motion.button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide">
              <span className="px-2 bg-black text-white/30">or</span>
            </div>
          </div>

          {/* Anonymous Login */}
          <motion.button
            onClick={handleAnonymousLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 py-4 px-6 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <UserX className="h-5 w-5" />
            )}
            <span>Continue anonymously</span>
          </motion.button>

          {/* Info */}
          <div className="text-center text-xs text-white/20 mt-6">
            <p>
              By signing in, you agree to our terms of service and privacy policy.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default LoginModal;