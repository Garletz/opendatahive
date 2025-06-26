import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, Eye, Github, UserX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
        className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        style={{
          boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName}
                className="w-12 h-12 rounded-full border-2 border-white/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                {user.isAnonymous ? (
                  <UserX className="h-6 w-6" />
                ) : (
                  <User className="h-6 w-6" />
                )}
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{user.displayName}</h3>
              <div className="flex items-center gap-2 text-primary-100 text-sm">
                {user.provider === 'github' ? (
                  <>
                    <Github className="h-4 w-4" />
                    <span>GitHub</span>
                  </>
                ) : (
                  <>
                    <UserX className="h-4 w-4" />
                    <span>Anonyme</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">{user.totalOctosCount}</div>
              <div className="text-sm text-gray-600">Total Octos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{user.publicOctosCount}</div>
              <div className="text-sm text-gray-600">Publics</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <motion.button
            onClick={() => {
              onMyOctos();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            whileHover={{ x: 4 }}
          >
            <Eye className="h-5 w-5 text-gray-500" />
            <span className="font-medium">My Octos</span>
          </motion.button>

          <motion.button
            onClick={() => {
              onSettings();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            whileHover={{ x: 4 }}
          >
            <Settings className="h-5 w-5 text-gray-500" />
            <span className="font-medium">Settings</span>
          </motion.button>

          <div className="border-t border-gray-200 my-2"></div>

          <motion.button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600"
            whileHover={{ x: 4 }}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </motion.button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 text-center text-xs text-gray-500">
          Member since {new Date(user.createdAt).toLocaleDateString('en-US')}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserProfile;