import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Github, UserX } from 'lucide-react';
import { useAuth } from '@/context';
import LoginModal from './LoginModal';
import UserProfile from './UserProfile';

interface AuthButtonProps {
  onMyOctos?: () => void;
  onSettings?: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({ onMyOctos = () => { }, onSettings = () => { } }) => {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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
      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse border border-white/10"></div>
    );
  }

  if (!user) {
    return (
      <>
        <motion.button
          onClick={() => setShowLoginModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 rounded-lg transition-all shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden md:inline font-medium text-sm">Sign In</span>
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
        className="flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/15 rounded-lg transition-all border border-white/20 hover:border-white/30"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-7 h-7 rounded-full border border-slate-600"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
            {user.provider === 'github' ? (
              <Github className="h-4 w-4 text-slate-300" />
            ) : (
              <UserX className="h-4 w-4 text-slate-300" />
            )}
          </div>
        )}
        <div className="hidden md:block text-left">
          <div className="text-white font-medium text-xs leading-tight">{user.displayName}</div>
          <div className="text-white/50 text-[10px]">
            {user.provider === 'github' ? 'GitHub' : 'Anonymous'}
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