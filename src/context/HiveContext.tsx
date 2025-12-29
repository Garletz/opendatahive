import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirebase } from './FirebaseContext';
import { useAuth } from './AuthContext';
import { useInteraction } from './InteractionContext';
import { Octo } from '@/types';
import { seedData } from '@/utils';

interface HiveContextType {
  octos: Octo[];
  loading: boolean;
  trendingFilter: 'all' | 'trending' | 'recent';
  setTrendingFilter: (filter: 'all' | 'trending' | 'recent') => void;
  refreshOctos: () => Promise<void>;
  viewMode: 'public' | 'personal' | 'all-users';
  setViewMode: (mode: 'public' | 'personal' | 'all-users') => void;
  targetUserId: string | null;
  setTargetUserId: (userId: string | null) => void;
}

const HiveContext = createContext<HiveContextType>({
  octos: [],
  loading: true,
  trendingFilter: 'all',
  setTrendingFilter: () => {},
  refreshOctos: async () => {},
  viewMode: 'public',
  setViewMode: () => {},
  targetUserId: null,
  setTargetUserId: () => {},
});

export const useHive = () => useContext(HiveContext);

export const HiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getOctos, addOcto, loading: firebaseLoading } = useFirebase();
  const { user } = useAuth();
  const { getOctoStats } = useInteraction();
  const [octos, setOctos] = useState<Octo[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingFilter, setTrendingFilter] = useState<'all' | 'trending' | 'recent'>('all');
  const [viewMode, setViewMode] = useState<'public' | 'personal' | 'all-users'>('public');
  const [targetUserId, setTargetUserId] = useState<string | null>(null);

  const refreshOctos = async () => {
    try {
      const firestoreOctos = await getOctos();
      let filteredOctos: Octo[];
      
      if (viewMode === 'all-users') {
        // Mode all-users : aucun octo affiché (seulement les utilisateurs sur la carte)
        filteredOctos = [];
      } else if (viewMode === 'personal') {
        if (targetUserId) {
          // Mode personnel avec utilisateur cible : octos de l'utilisateur spécifique
          filteredOctos = firestoreOctos.filter(octo => octo.authorId === targetUserId);
        } else if (user) {
          // Mode personnel normal : octos de l'utilisateur connecté
          filteredOctos = firestoreOctos.filter(octo => octo.authorId === user.id);
        } else {
          filteredOctos = [];
        }
      } else {
        // Mode public : octos publics de tous
        filteredOctos = firestoreOctos.filter(octo => octo.isPublic !== false);
      }
      
      // Enrichir les octos avec les statistiques
      const enrichedOctos = await Promise.all(
        filteredOctos.map(async (octo) => {
          const stats = await getOctoStats(octo.id);
          return {
            ...octo,
            viewCount: stats?.views || 0,
            stats: user && octo.authorId === user.id ? {
              views: stats?.views || 0,
              clicks: stats?.clicks || 0,
              likes: stats?.likes || 0,
              downloads: stats?.downloads || 0,
              score: stats?.score || 0,
              trending: stats?.trending || false
            } : undefined
          };
        })
      );

      // Appliquer le filtre de tendance
      let sortedOctos = enrichedOctos;
      
      if (trendingFilter === 'trending') {
        // Filtrer les octos avec un score de tendance élevé ou marqués comme tendance
        sortedOctos = enrichedOctos
          .filter(octo => {
            // Un octo est tendance s'il a des stats et soit trending=true soit un score élevé
            if (octo.stats) {
              return octo.stats.trending || octo.stats.score > 20;
            }
            // Pour les octos sans stats, utiliser le viewCount
            return (octo.viewCount || 0) > 10;
          })
          .sort((a, b) => {
            // Trier par score de tendance puis par score général
            const scoreA = a.stats?.score || a.viewCount || 0;
            const scoreB = b.stats?.score || b.viewCount || 0;
            return scoreB - scoreA;
          });
      } else if (trendingFilter === 'recent') {
        sortedOctos = enrichedOctos.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        // Tri par défaut : score puis date de création
        sortedOctos = enrichedOctos.sort((a, b) => {
          const scoreA = a.stats?.score || a.viewCount || 0;
          const scoreB = b.stats?.score || b.viewCount || 0;
          if (scoreA !== scoreB) {
            return scoreB - scoreA;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
      
      // Si la base de données est vide, ajouter les données de test
      if (firestoreOctos.length === 0 && user) {
        console.log("Empty database, adding test data...");
        for (const octo of seedData) {
          await addOcto({
            ...octo,
            authorId: user.id,
            authorName: user.displayName,
            isPublic: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        // Récupérer à nouveau les octos après l'ajout des données de test
        const updatedOctos = await getOctos();
        const filteredUpdatedOctos = updatedOctos.filter(octo => 
          octo.isPublic !== false || octo.authorId === user?.id
        );
        setOctos(filteredUpdatedOctos);
      } else {
        setOctos(sortedOctos);
      }
    } catch (error) {
      console.error("Error refreshing octos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Rafraîchir quand Firebase est prêt ou quand l'utilisateur change
    if (!firebaseLoading) {
      refreshOctos();
    }
  }, [firebaseLoading, user, trendingFilter, viewMode, targetUserId]);

  const value = {
    octos,
    loading,
    trendingFilter,
    setTrendingFilter,
    refreshOctos,
    viewMode,
    setViewMode,
    targetUserId,
    setTargetUserId,
  };

  return (
    <HiveContext.Provider value={value}>
      {children}
    </HiveContext.Provider>
  );
};