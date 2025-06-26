import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Github, UserX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoginModal from './LoginModal';
import UserProfile from './UserProfile';

interface AuthButtonProps {
  onMyOctos?: () => void;
  onSettings?: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({ onMyOctos = () => {}, onSettings = () => {} }) => {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fermer le profil utilisateur quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowUserProfile(false);
      }
    };

    if (showUserProfile) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserProfile]);

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  if (!user) {
    return (
      <>
        <motion.button
          onClick={() => setShowLoginModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          style={{
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <LogIn className="h-5 w-5" />
          <span className="hidden md:inline font-medium">Sign In</span>
        </motion.button>

        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </>
    );
  }

  return (
    <div className="relative" ref={profileRef}>
      <motion.button
        onClick={() => setShowUserProfile(!showUserProfile)}
        className="flex items-center gap-3 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt={user.displayName}
            className="w-8 h-8 rounded-full border border-white/30"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            {user.provider === 'github' ? (
              <Github className="h-4 w-4 text-white" />
            ) : (
              <UserX className="h-4 w-4 text-white" />
            )}
          </div>
        )}
        <div className="hidden md:block text-left">
          <div className="text-white font-medium text-sm">{user.displayName}</div>
          <div className="text-primary-100 text-xs">
            {user.provider === 'github' ? 'GitHub' : 'Anonyme'}
          </div>
        </div>
      </motion.button>

      <UserProfile 
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
        onMyOctos={onMyOctos}
        onSettings={onSettings}
      />
    </div>
  );
};

export default AuthButton;