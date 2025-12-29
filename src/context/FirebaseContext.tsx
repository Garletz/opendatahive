import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Firestore,
  query,
  where,
} from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Octo } from '@/types';
import { DataRequest, DataRequestSubmission } from '@/types';
import { handleFirebaseError } from '@/utils';

// Firebase configuration - should be moved to environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Interface for the Firebase context
interface FirebaseContextType {
  db: Firestore | null;
  loading: boolean;
  getOctos: () => Promise<Octo[]>;
  addOcto: (octo: Omit<Octo, 'id'> & { files?: { name: string; type: string; file?: File; url?: string }[] }) => Promise<string>;
  updateOcto: (id: string, octo: Partial<Octo>) => Promise<void>;
  deleteOcto: (id: string) => Promise<void>;
  searchOctos: (tag: string) => Promise<Octo[]>;
  deleteNestedGroup: (nestedGroupId: string) => Promise<void>;
  // Data Requests functions
  addDataRequest: (request: Omit<DataRequest, 'id'>) => Promise<string>;
  getDataRequests: (publicOnly?: boolean) => Promise<DataRequest[]>;
  updateDataRequest: (id: string, request: Partial<DataRequest>) => Promise<void>;
  deleteDataRequest: (id: string) => Promise<void>;
  addDataRequestSubmission: (submission: Omit<DataRequestSubmission, 'id'>) => Promise<string>;
  getDataRequestSubmissions: (requestId: string) => Promise<DataRequestSubmission[]>;
  cleanupExpiredDataRequests: () => Promise<void>;
  deleteUserOctos: (userId: string) => Promise<void>;
  deleteUserDataRequests: (userId: string) => Promise<void>;
  deleteUserInteractions: (userId: string) => Promise<void>;
}

// Create the context
const FirebaseContext = createContext<FirebaseContextType>({
  db: null,
  loading: true,
  getOctos: async () => [],
  addOcto: async () => "",
  updateOcto: async () => { },
  deleteOcto: async () => { },
  searchOctos: async () => [],
  deleteNestedGroup: async () => { },
  addDataRequest: async () => "",
  getDataRequests: async () => [],
  updateDataRequest: async () => { },
  deleteDataRequest: async () => { },
  addDataRequestSubmission: async () => "",
  getDataRequestSubmissions: async () => [],
  cleanupExpiredDataRequests: async () => { },
  deleteUserOctos: async () => { },
  deleteUserDataRequests: async () => { },
  deleteUserInteractions: async () => { },
});

// Custom hook for using the Firebase context
export const useFirebase = () => useContext(FirebaseContext);

// Provider component
export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storage, setStorage] = useState<any>(null);

  useEffect(() => {
    try {
      const s = getStorage(app);
      setStorage(s);
    } catch (error) {
      console.error("Error initializing Firebase Storage:", error);
    }
  }, []);

  // Upload un fichier dans Firebase Storage et retourne son URL
  const uploadFile = async (file: File, octoId?: string): Promise<string> => {
    if (!storage) throw new Error("Firebase Storage not initialized");
    const ext = file.name.split('.').pop();
    const filePath = `octos/${octoId || 'temp'}/${Date.now()}_${file.name}`;
    const fileRef = storageRef(storage, filePath);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  const [db, setDb] = useState<Firestore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Firebase
    try {
      const firestore = getFirestore(app);
      setDb(firestore);
    } catch (error) {
      console.error("Error initializing Firebase:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour ajouter un nouvel Octo avec upload de fichiers
  const addOcto = async (octo: Omit<Octo, 'id'> & { files?: { name: string; type: string; file?: File; url?: string }[] }): Promise<string> => {
    if (!db) throw new Error("Database not initialized");

    return handleFirebaseError(async () => {
      let filesMeta = undefined;
      if (octo.files && octo.files.length > 0) {
        filesMeta = await Promise.all(
          octo.files.map(async (f) => {
            if (f.file) {
              // Upload le fichier et récupère l'URL
              const url = await uploadFile(f.file);
              return { name: f.name, url, type: f.type };
            } else if (f.url) {
              // Cas fallback (url déjà présente)
              return { name: f.name, url: f.url, type: f.type };
            }
            return null;
          })
        );
        filesMeta = filesMeta.filter(Boolean);
      }
      const octoToSave = { ...octo, files: filesMeta };
      delete octoToSave['file'];
      // On enlève la clé 'file' de chaque fichier
      if (octoToSave.files) {
        octoToSave.files = octoToSave.files.map((f: any) => {
          const { file, ...rest } = f;
          return rest;
        });
      }
      const docRef = await addDoc(collection(db, 'octos'), octoToSave);
      return docRef.id;
    });
  };

  // Function to get all Octos
  const getOctos = async (): Promise<Octo[]> => {
    if (!db) return [];

    return handleFirebaseError(async () => {
      const octosCollection = collection(db, 'octos');
      const snapshot = await getDocs(octosCollection);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Octo));
    });
  };

  // Function to update an Octo
  const updateOcto = async (id: string, octo: Partial<Octo>): Promise<void> => {
    if (!db) throw new Error("Database not initialized");

    return handleFirebaseError(async () => {
      console.log('Updating octo:', id, octo);
      const octoRef = doc(db, 'octos', id);
      await updateDoc(octoRef, octo);
    });
  };

  // Function to delete an Octo
  const deleteOcto = async (id: string): Promise<void> => {
    if (!db) throw new Error("Database not initialized");
    if (!storage) throw new Error("Firebase Storage not initialized");

    return handleFirebaseError(async () => {
      // Récupère le document pour avoir les URLs des fichiers
      const octoRef = doc(db, 'octos', id);
      const { getDoc } = await import('firebase/firestore');
      const octoSnap = await getDoc(octoRef);
      const octoData = octoSnap.exists() ? octoSnap.data() : undefined;
      if (octoData && Array.isArray(octoData.files)) {
        for (const file of octoData.files) {
          if (file.url) {
            try {
              // Récupère le chemin Storage à partir de l'URL
              const url = file.url;
              const baseUrl = `https://firebasestorage.googleapis.com/v0/b/`;
              if (url.startsWith(baseUrl)) {
                const pathPart = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
                const fileRef = storageRef(storage, pathPart);
                await deleteObject(fileRef);
              }
            } catch (e) {
              console.warn('Erreur suppression fichier Storage:', file.url, e);
            }
          }
        }
      }
      await deleteDoc(octoRef);
    });
  };

  // Function to search Octos by tag
  const searchOctos = async (tag: string): Promise<Octo[]> => {
    if (!db) return [];

    return handleFirebaseError(async () => {
      const octosCollection = collection(db, 'octos');
      const q = query(octosCollection, where("tags", "array-contains", tag));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Octo));
    });
  };

  // Function to delete a nested group (parent + all children)
  const deleteNestedGroup = async (nestedGroupId: string): Promise<void> => {
    if (!db) throw new Error("Database not initialized");

    return handleFirebaseError(async () => {
      // Get all octos in the nested group
      const octosCollection = collection(db, 'octos');
      const q = query(octosCollection, where("nestedGroupId", "==", nestedGroupId));
      const snapshot = await getDocs(q);

      // Delete all octos in the group
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    });
  };

  // Function to add a new Data Request
  const addDataRequest = async (request: Omit<DataRequest, 'id'>): Promise<string> => {
    if (!db) throw new Error("Database not initialized");

    try {
      const requestWithTimestamp = {
        ...request,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'dataRequests'), requestWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error("Error adding data request:", error);
      throw error;
    }
  };

  // Function to get Data Requests
  const getDataRequests = async (publicOnly: boolean = false): Promise<DataRequest[]> => {
    if (!db) return [];

    return handleFirebaseError(async () => {
      const requestsCollection = collection(db, 'dataRequests');

      let snapshot;
      if (publicOnly) {
        const q = query(requestsCollection, where("isPublic", "==", true));
        snapshot = await getDocs(q);
      } else {
        snapshot = await getDocs(requestsCollection);
      }

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DataRequest));
    });
  };

  // Function to update a Data Request
  const updateDataRequest = async (id: string, request: Partial<DataRequest>): Promise<void> => {
    if (!db) throw new Error("Database not initialized");

    try {
      const requestRef = doc(db, 'dataRequests', id);
      await updateDoc(requestRef, {
        ...request,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating data request:", error);
      throw error;
    }
  };

  // Function to delete a Data Request
  const deleteDataRequest = async (id: string): Promise<void> => {
    if (!db) throw new Error("Database not initialized");

    try {
      await deleteDoc(doc(db, 'dataRequests', id));
    } catch (error) {
      console.error("Error deleting data request:", error);
      throw error;
    }
  };

  // Function to add a Data Request Submission
  const addDataRequestSubmission = async (submission: Omit<DataRequestSubmission, 'id'>): Promise<string> => {
    if (!db) throw new Error("Database not initialized");

    try {
      const submissionWithTimestamp = {
        ...submission,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'dataRequestSubmissions'), submissionWithTimestamp);
      return docRef.id;
    } catch (error) {
      console.error("Error adding data request submission:", error);
      throw error;
    }
  };

  // Function to get Data Request Submissions
  const getDataRequestSubmissions = async (requestId: string): Promise<DataRequestSubmission[]> => {
    if (!db) return [];

    try {
      const submissionsCollection = collection(db, 'dataRequestSubmissions');
      const q = query(submissionsCollection, where("requestId", "==", requestId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DataRequestSubmission));
    } catch (error) {
      console.error("Error fetching data request submissions:", error);
      return [];
    }
  };

  // Function to cleanup expired data requests
  const cleanupExpiredDataRequests = async (): Promise<void> => {
    if (!db) throw new Error("Database not initialized");

    try {
      const requestsCollection = collection(db, 'dataRequests');
      const snapshot = await getDocs(requestsCollection);
      const now = new Date();

      const deletePromises = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as DataRequest))
        .filter(request => {
          if (request.deadline) {
            // Si une deadline est définie et qu'elle est dépassée
            const deadline = new Date(request.deadline);
            return now > deadline;
          } else {
            // Si pas de deadline, supprimer après 100 jours
            const createdDate = new Date(request.createdAt);
            const daysSinceCreated = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
            return daysSinceCreated > 100;
          }
        })
        .map(request => deleteDoc(doc(db, 'dataRequests', request.id)));

      await Promise.all(deletePromises);
      console.log(`Cleaned up ${deletePromises.length} expired data requests`);
    } catch (error) {
      console.error("Error cleaning up expired data requests:", error);
      throw error;
    }
  };

  // Function to delete all octos for a specific user
  const deleteUserOctos = async (userId: string): Promise<void> => {
    if (!db) throw new Error("Database not initialized");

    try {
      const q = query(collection(db, 'octos'), where("authorId", "==", userId));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log(`Deleted ${deletePromises.length} octos for user ${userId}`);
    } catch (error) {
      console.error("Error deleting user octos:", error);
      throw error;
    }
  };

  // Function to delete all data requests for a specific user
  const deleteUserDataRequests = async (userId: string): Promise<void> => {
    if (!db) throw new Error("Database not initialized");

    try {
      const q = query(collection(db, 'dataRequests'), where("authorId", "==", userId));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log(`Deleted ${deletePromises.length} data requests for user ${userId}`);
    } catch (error) {
      console.error("Error deleting user data requests:", error);
      throw error;
    }
  };

  // Function to delete all interactions for a specific user
  const deleteUserInteractions = async (userId: string): Promise<void> => {
    if (!db) throw new Error("Database not initialized");

    try {
      const q = query(collection(db, 'interactions'), where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      console.log(`Deleted ${deletePromises.length} interactions for user ${userId}`);
    } catch (error) {
      console.error("Error deleting user interactions:", error);
      throw error;
    }
  };

  const value = {
    db,
    loading,
    getOctos,
    addOcto,
    uploadFile,
    updateOcto,
    deleteOcto,
    searchOctos,
    deleteNestedGroup,
    addDataRequest,
    getDataRequests,
    updateDataRequest,
    deleteDataRequest,
    addDataRequestSubmission,
    getDataRequestSubmissions,
    cleanupExpiredDataRequests,
    deleteUserOctos,
    deleteUserDataRequests,
    deleteUserInteractions,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};