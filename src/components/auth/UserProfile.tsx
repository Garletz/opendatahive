import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, Eye, Github, UserX } from 'lucide-react';
import { useAuth } from '@/context';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onMyOctos: () => void;
  onSettings: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose, onMyOctos, onSettings }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="absolute top-full right-0 mt-3 w-72 bg-black/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50"
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {/* Header */}
        <div className="bg-white/5 p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-10 h-10 rounded-full border border-white/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                {user.isAnonymous ? (
                  <UserX className="h-5 w-5 text-white/50" />
                ) : (
                  <User className="h-5 w-5 text-white/50" />
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-white truncate">{user.displayName}</h3>
              <div className="flex items-center gap-1.5 text-white/50 text-xs mt-0.5">
                {user.provider === 'github' ? (
                  <>
                    <Github className="h-3 w-3" />
                    <span>GitHub</span>
                  </>
                ) : (
                  <>
                    <UserX className="h-3 w-3" />
                    <span>Anonymous</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2 space-y-1">
          <motion.button
            onClick={() => {
              onMyOctos();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/10 rounded-lg transition-colors text-white/90 hover:text-white"
            whileHover={{ x: 2 }}
          >
            <Eye className="h-4 w-4 text-white/50 group-hover:text-white" />
            <span className="font-medium text-sm">My Sources</span>
          </motion.button>

          <motion.button
            onClick={() => {
              onSettings();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/10 rounded-lg transition-colors text-white/90 hover:text-white"
            whileHover={{ x: 2 }}
          >
            <Settings className="h-4 w-4 text-white/50 group-hover:text-white" />
            <span className="font-medium text-sm">Settings</span>
          </motion.button>

          <div className="border-t border-white/10 my-1 mx-2"></div>

          <motion.button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-red-500/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
            whileHover={{ x: 2 }}
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium text-sm">Sign Out</span>
          </motion.button>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-transparent text-center border-t border-white/10">
          <p className="text-[10px] text-white/20 uppercase tracking-wider font-medium">
            Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserProfile;