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
  where
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { Octo } from '../types/octo';
import { DataRequest, DataRequestSubmission } from '../types/dataRequest';
import { handleFirebaseError } from '../utils/firebaseErrorHandler';

// Firebase configuration from environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

// Check if all required environment variables are present
const missingEnvVars = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required Firebase environment variables:', missingEnvVars);
  console.error('Please check your .env file and ensure all Firebase configuration variables are set.');
  console.error('Refer to .env.example for the required variables.');
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Optional
};

// Initialize Firebase only if configuration is complete
let app: any = null;
let analytics: ReturnType<typeof getAnalytics> | null = null;

if (missingEnvVars.length === 0) {
  try {
    app = initializeApp(firebaseConfig);
    
    // Initialize analytics only in production and if measurementId is provided
    if (import.meta.env.PROD && firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
    
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
  }
} else {
  console.warn('⚠️ Firebase not initialized due to missing configuration');
}

// Interface for the Firebase context
interface FirebaseContextType {
  db: Firestore | null;
  loading: boolean;
  getOctos: () => Promise<Octo[]>;
  addOcto: (octo: Omit<Octo, 'id'>) => Promise<string>;
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
  updateOcto: async () => {},
  deleteOcto: async () => {},
  searchOctos: async () => [],
  deleteNestedGroup: async () => {},
  addDataRequest: async () => "",
  getDataRequests: async () => [],
  updateDataRequest: async () => {},
  deleteDataRequest: async () => {},
  addDataRequestSubmission: async () => "",
  getDataRequestSubmissions: async () => [],
  cleanupExpiredDataRequests: async () => {},
  deleteUserOctos: async () => {},
  deleteUserDataRequests: async () => {},
  deleteUserInteractions: async () => {},
});

// Custom hook for using the Firebase context
export const useFirebase = () => useContext(FirebaseContext);

// Provider component
export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<Firestore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Firestore if Firebase app is available
    try {
      if (app) {
        const firestore = getFirestore(app);
        setDb(firestore);
        console.log('✅ Firestore initialized successfully');
      } else {
        console.error('❌ Cannot initialize Firestore: Firebase app not available');
        console.error('Please check your Firebase configuration in the .env file');
      }
    } catch (error) {
      console.error("❌ Error initializing Firestore:", error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Function to add a new Octo
  const addOcto = async (octo: Omit<Octo, 'id'>): Promise<string> => {
    if (!db) throw new Error("Database not initialized");
    
    return handleFirebaseError(async () => {
      const octoWithTimestamp = {
        ...octo,
        addedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'octos'), octoWithTimestamp);
      return docRef.id;
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
    
    return handleFirebaseError(async () => {
      console.log('Deleting octo:', id);
      await deleteDoc(doc(db, 'octos', id));
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