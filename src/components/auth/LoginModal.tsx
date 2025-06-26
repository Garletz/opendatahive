import React from 'react';
import { motion } from 'framer-motion';
import { X, Github, UserX, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        background: 'radial-gradient(circle at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        style={{
          boxShadow: '0 25px 50px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <h2 className="font-heading font-bold text-2xl mb-2">Sign In</h2>
            <p className="text-primary-100">
              Sign in to add and manage your octos
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <motion.div 
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
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
            className="w-full flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white py-4 px-6 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Github className="h-5 w-5" />
            )}
            <span>Continue with GitHub</span>
          </motion.button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Anonymous Login */}
          <motion.button
            onClick={handleAnonymousLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-4 px-6 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -2 }}
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
          <div className="text-center text-sm text-gray-600 mt-4">
            <p>
              By signing in, you agree to our terms of service
              and privacy policy.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginModal;