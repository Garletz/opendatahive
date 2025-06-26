import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Trash2, Github, UserX, Link, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFirebase } from '../context/FirebaseContext';

interface SettingsPageProps {
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { user, deleteUserAccount, linkAnonymousWithGitHub, error } = useAuth();
  const { deleteUserDataRequests, deleteUserInteractions } = useFirebase();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== 'DELETE') return;
    
    setIsDeleting(true);
    try {
      await deleteUserAccount();
      // L'utilisateur sera automatiquement déconnecté et redirigé
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  const handleLinkWithGitHub = async () => {
    if (!user || !user.isAnonymous) return;
    
    setIsLinking(true);
    try {
      await linkAnonymousWithGitHub();
    } catch (error) {
      console.error('Error linking account:', error);
    } finally {
      setIsLinking(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You must be logged in to access settings.</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={onBack}
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </motion.button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-gray-800">Settings</h1>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div 
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Error:</span>
            </div>
            <p className="mt-1">{error}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Information */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
                <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                <div className="flex items-center gap-4">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName}
                      className="w-16 h-16 rounded-full border-2 border-white/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      {user.isAnonymous ? (
                        <UserX className="h-8 w-8" />
                      ) : (
                        <Github className="h-8 w-8" />
                      )}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{user.displayName}</h3>
                    <p className="text-primary-100">{user.email || 'No email provided'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {user.isAnonymous ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                          Anonymous Account
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          GitHub Account
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="text-sm text-gray-500">
                  <p>
                    Member since {
                      user.createdAt && user.createdAt !== 'Invalid Date' 
                        ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : 'Recently'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Account Persistence for Anonymous Users */}
            {user.isAnonymous && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Link className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Make Your Account Persistent</h3>
                    <p className="text-gray-600 mb-4">
                      Your anonymous account is temporary and will be lost if you clear your browser data. 
                      Link it to GitHub to make it permanent and access it from any device.
                    </p>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-blue-900 mb-2">Benefits of linking to GitHub:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Access your account from any device</li>
                        <li>• Never lose your data</li>
                        <li>• Enhanced security</li>
                        <li>• Profile picture and verified identity</li>
                      </ul>
                    </div>
                    
                    <button
                      onClick={handleLinkWithGitHub}
                      disabled={isLinking}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLinking ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Linking...
                        </>
                      ) : (
                        <>
                          <Github className="h-5 w-5" />
                          Link to GitHub
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Danger Zone */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Data Management */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
              </div>
              
              <div className="space-y-3 text-sm text-gray-600">
                <p>Your data is stored securely and you have full control over it.</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">What we store:</h4>
                  <ul className="space-y-1">
                    <li>• Your octos and data sources</li>
                    <li>• Data requests you've created</li>
                    <li>• Your interactions and statistics</li>
                    <li>• Account information</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-700 mb-3">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-red-100 p-3 rounded-lg">
                        <p className="text-sm text-red-800 font-medium mb-2">
                          ⚠️ This will permanently delete:
                        </p>
                        <ul className="text-xs text-red-700 space-y-1">
                          <li>• All your octos and data sources</li>
                          <li>• All your data requests</li>
                          <li>• All your interactions and statistics</li>
                          <li>• Your account information</li>
                        </ul>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-red-900 mb-2">
                          Type "DELETE" to confirm:
                        </label>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                          placeholder="DELETE"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Confirm Delete
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText('');
                          }}
                          className="px-4 py-2 text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;