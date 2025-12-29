import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  signInWithPopup, 
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GithubAuthProvider,
  linkWithPopup
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { useFirebase } from './FirebaseContext';
import { User, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  signInWithGitHub: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  deleteUserAccount: () => Promise<void>;
  linkAnonymousWithGitHub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInWithGitHub: async () => {},
  signInAnonymously: async () => {},
  signOut: async () => {},
  updateUserProfile: async () => {},
  deleteUserAccount: async () => {},
  linkAnonymousWithGitHub: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db, deleteUserOctos, deleteUserDataRequests, deleteUserInteractions } = useFirebase();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  const auth = getAuth();

  // Convertir un utilisateur Firebase en utilisateur de l'app
  const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    if (!db) throw new Error("Database not initialized");

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    let userData: User;

    if (userDoc.exists()) {
      // Utilisateur existant
      userData = userDoc.data() as User;
      
      // Mettre à jour les informations si nécessaire
      const updates: Partial<User> = {};
      if (userData.displayName !== firebaseUser.displayName) {
        updates.displayName = firebaseUser.displayName || userData.displayName;
      }
      if (userData.email !== firebaseUser.email) {
        updates.email = firebaseUser.email || userData.email;
      }
      if (userData.photoURL !== firebaseUser.photoURL) {
        updates.photoURL = firebaseUser.photoURL || userData.photoURL;
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
        userData = { ...userData, ...updates };
      }
    } else {
      // Nouvel utilisateur
      userData = {
        id: firebaseUser.uid,
        displayName: firebaseUser.displayName || `User ${firebaseUser.uid.slice(0, 8)}`,
        email: firebaseUser.email || null,
        photoURL: firebaseUser.photoURL || null,
        provider: firebaseUser.isAnonymous ? 'anonymous' : 'github',
        createdAt: new Date().toISOString(),
        publicOctosCount: 0,
        totalOctosCount: 0,
        isAnonymous: firebaseUser.isAnonymous
      };

      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp()
      });
    }

    return userData;
  };

  // Connexion avec GitHub
  const signInWithGitHub = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const provider = new GithubAuthProvider();
      provider.addScope('user:email');
      
      const result = await signInWithPopup(auth, provider);
      const user = await convertFirebaseUser(result.user);
      
      setAuthState({
        user,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Erreur lors de la connexion GitHub:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erreur lors de la connexion'
      }));
    }
  };

  // Connexion anonyme
  const signInAnonymouslyHandler = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('Tentative de connexion anonyme...');
      const result = await signInAnonymously(auth);
      console.log('Connexion anonyme réussie:', result.user);
      const user = await convertFirebaseUser(result.user);
      console.log('Utilisateur converti:', user);
      
      setAuthState({
        user,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Erreur lors de la connexion anonyme:', error);
      console.error('Code d\'erreur:', error.code);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Erreur lors de la connexion anonyme'
      }));
    }
  };

  // Déconnexion
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Erreur lors de la déconnexion'
      }));
    }
  };

  // Mettre à jour le profil utilisateur
  const updateUserProfile = async (data: Partial<User>) => {
    if (!authState.user || !db) return;

    try {
      const userRef = doc(db, 'users', authState.user.id);
      await updateDoc(userRef, data);
      
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...data } : null
      }));
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setAuthState(prev => ({
        ...prev,
        error: error.message || 'Erreur lors de la mise à jour du profil'
      }));
    }
  };

  // Supprimer le compte utilisateur et toutes ses données
  const deleteUserAccount = async () => {
    if (!authState.user || !db) {
      setAuthState(prev => ({ ...prev, error: 'User not authenticated or database not initialized.' }));
      return;
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      // Supprimer toutes les données utilisateur de Firestore
      await deleteUserOctos(authState.user.id);
      await deleteUserDataRequests(authState.user.id);
      await deleteUserInteractions(authState.user.id);
      
      // Supprimer le document utilisateur
      await deleteDoc(doc(db, 'users', authState.user.id));
      
      // Supprimer le compte Firebase Auth
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }

      // Déconnecter explicitement l'utilisateur et nettoyer l'état
      await firebaseSignOut(auth);
      setAuthState({ user: null, loading: false, error: null });
      console.log('User account and data deleted successfully.');
    } catch (error: any) {
      console.error('Error deleting user account:', error);
      if (error.code === 'auth/requires-recent-login') {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Please re-authenticate to delete your account. Sign out and sign in again, then try deleting.'
        }));
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Error deleting account.'
        }));
      }
    }
  };

  // Lier un compte anonyme à GitHub
  const linkAnonymousWithGitHub = async () => {
    if (!authState.user || !authState.user.isAnonymous || !auth.currentUser) {
      setAuthState(prev => ({ ...prev, error: 'Not an anonymous user or user not authenticated.' }));
      return;
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const provider = new GithubAuthProvider();
      provider.addScope('user:email');
      
      const result = await linkWithPopup(auth.currentUser, provider);
      
      // Mettre à jour les données utilisateur dans Firestore
      const updatedUserData = {
        provider: 'github' as const,
        isAnonymous: false,
        displayName: result.user.displayName || authState.user.displayName,
        photoURL: result.user.photoURL,
        email: result.user.email
      };
      
      await updateUserProfile(updatedUserData);
      
      const updatedUser = await convertFirebaseUser(result.user);
      
      setAuthState({
        user: updatedUser,
        loading: false,
        error: null
      });
      console.log('Anonymous account linked with GitHub successfully.');
    } catch (error: any) {
      console.error('Error linking anonymous account:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Error linking account.'
      }));
    }
  };

  // Écouter les changements d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await convertFirebaseUser(firebaseUser);
          setAuthState({
            user,
            loading: false,
            error: null
          });
        } catch (error: any) {
          console.error('Erreur lors de la conversion de l\'utilisateur:', error);
          setAuthState({
            user: null,
            loading: false,
            error: error.message || 'Erreur lors de l\'authentification'
          });
        }
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: null
        });
      }
    });

    return () => unsubscribe();
  }, [db]);

  const value: AuthContextType = {
    ...authState,
    signInWithGitHub,
    signInAnonymously: signInAnonymouslyHandler,
    signOut,
    updateUserProfile,
    deleteUserAccount,
    linkAnonymousWithGitHub,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};