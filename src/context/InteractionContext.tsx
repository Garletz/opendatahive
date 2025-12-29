import React, { createContext, useContext } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  setDoc,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { useFirebase } from './FirebaseContext';
import { useAuth } from './AuthContext';
import { UserInteraction, OctoStats } from '@/types';

interface InteractionContextType {
  trackInteraction: (octoId: string, type: UserInteraction['type'], metadata?: UserInteraction['metadata']) => Promise<void>;
  getOctoStats: (octoId: string) => Promise<OctoStats | null>;
  getTrendingOctos: (period?: '1h' | '24h' | '7d' | '30d', limitCount?: number) => Promise<string[]>;
  updateOctoScore: (octoId: string) => Promise<void>;
  getUserInteractions: (userId: string, type?: UserInteraction['type']) => Promise<UserInteraction[]>;
}

const InteractionContext = createContext<InteractionContextType>({
  trackInteraction: async () => {},
  getOctoStats: async () => null,
  getTrendingOctos: async () => [],
  updateOctoScore: async () => {},
  getUserInteractions: async () => [],
});

export const useInteraction = () => useContext(InteractionContext);

export const InteractionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { db } = useFirebase();
  const { user } = useAuth();

  // Calculer le score d'un octo basé sur les interactions
  const calculateScore = (stats: Partial<OctoStats>): number => {
    const views = stats.views || 0;
    const clicks = stats.clicks || 0;
    const likes = stats.likes || 0;
    const downloads = stats.downloads || 0;
    
    // Formule de scoring : vues + 2×clics + 4×likes + 5×téléchargements
    return views + (clicks * 2) + (likes * 4) + (downloads * 5);
  };

  // Calculer le score de tendance basé sur la période
  const calculateTrendingScore = (interactions: UserInteraction[], period: string): number => {
    const now = new Date();
    let cutoffTime: Date;
    
    switch (period) {
      case '1h':
        cutoffTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const recentInteractions = interactions.filter(
      interaction => new Date(interaction.timestamp) > cutoffTime
    );

    // Calculer le score de tendance avec plus de poids sur les interactions récentes
    let trendingScore = 0;
    recentInteractions.forEach(interaction => {
      const timeDiff = now.getTime() - new Date(interaction.timestamp).getTime();
      const recencyMultiplier = Math.max(0.1, 1 - (timeDiff / (24 * 60 * 60 * 1000))); // Décroissance sur 24h
      
      switch (interaction.type) {
        case 'view':
          trendingScore += 1 * recencyMultiplier;
          break;
        case 'click':
          trendingScore += 3 * recencyMultiplier;
          break;
        case 'like':
          trendingScore += 5 * recencyMultiplier;
          break;
        case 'download':
          trendingScore += 8 * recencyMultiplier;
          break;
      }
    });

    return Math.round(trendingScore * 100) / 100;
  };

  // Enregistrer une interaction utilisateur
  const trackInteraction = async (
    octoId: string, 
    type: UserInteraction['type'], 
    metadata?: UserInteraction['metadata']
  ): Promise<void> => {
    if (!db || !user) return;

    try {
      // Enregistrer l'interaction
      const interaction: Omit<UserInteraction, 'id'> = {
        userId: user.id,
        octoId,
        type,
        timestamp: new Date().toISOString(),
        metadata
      };

      await addDoc(collection(db, 'interactions'), {
        ...interaction,
        timestamp: serverTimestamp()
      });

      // Mettre à jour les statistiques de l'octo
      // Update octo statistics
      await updateOctoScore(octoId);

      console.log(`Interaction ${type} recorded for octo ${octoId}`);
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  // Récupérer les statistiques d'un octo
  const getOctoStats = async (octoId: string): Promise<OctoStats | null> => {
    if (!db) return null;

    try {
      const statsDoc = await getDoc(doc(db, 'octoStats', octoId));
      
      if (statsDoc.exists()) {
        return statsDoc.data() as OctoStats;
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving stats:', error);
      return null;
    }
  };

  // Mettre à jour le score d'un octo
  const updateOctoScore = async (octoId: string): Promise<void> => {
    if (!db) return;

    try {
      // Récupérer toutes les interactions pour cet octo
      const interactionsQuery = query(
        collection(db, 'interactions'),
        where('octoId', '==', octoId)
      );
      
      const interactionsSnapshot = await getDocs(interactionsQuery);
      const interactions = interactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserInteraction[];

      // Compter les interactions par type
      const stats = {
        views: interactions.filter(i => i.type === 'view').length,
        clicks: interactions.filter(i => i.type === 'click').length,
        likes: interactions.filter(i => i.type === 'like').length,
        downloads: interactions.filter(i => i.type === 'download').length,
      };

      const score = calculateScore(stats);
      const trendingScore = calculateTrendingScore(interactions, '24h');
      const trending = trendingScore > 5 || score > 15; // Seuil plus bas pour être considéré comme tendance

      const octoStats: OctoStats = {
        octoId,
        ...stats,
        score,
        trendingScore,
        trending,
        lastUpdated: new Date().toISOString()
      };

      // Sauvegarder les stats
      await setDoc(doc(db, 'octoStats', octoId), {
        ...octoStats,
        lastUpdated: serverTimestamp()
      });

    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  // Récupérer les octos tendance
  const getTrendingOctos = async (
    _period: '1h' | '24h' | '7d' | '30d' = '24h', 
    limitCount: number = 10
  ): Promise<string[]> => {
    if (!db) return [];

    try {
      // Récupérer les stats triées par score de tendance
      const statsQuery = query(
        collection(db, 'octoStats'),
        where('trending', '==', true),
        orderBy('trendingScore', 'desc'),
        limit(limitCount)
      );

      const statsSnapshot = await getDocs(statsQuery);
      return statsSnapshot.docs.map(doc => doc.data().octoId);
    } catch (error) {
      console.error('Error retrieving trends:', error);
      return [];
    }
  };

  // Récupérer les interactions d'un utilisateur
  const getUserInteractions = async (
    userId: string, 
    type?: UserInteraction['type']
  ): Promise<UserInteraction[]> => {
    if (!db) return [];

    try {
      let interactionsQuery = query(
        collection(db, 'interactions'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );

      if (type) {
        interactionsQuery = query(
          collection(db, 'interactions'),
          where('userId', '==', userId),
          where('type', '==', type),
          orderBy('timestamp', 'desc')
        );
      }

      const snapshot = await getDocs(interactionsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserInteraction[];
    } catch (error) {
      console.error('Error retrieving user interactions:', error);
      return [];
    }
  };

  const value = {
    trackInteraction,
    getOctoStats,
    getTrendingOctos,
    updateOctoScore,
    getUserInteractions,
  };

  return (
    <InteractionContext.Provider value={value}>
      {children}
    </InteractionContext.Provider>
  );
};