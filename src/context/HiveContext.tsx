import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirebase } from './FirebaseContext';
import { useAuth } from './AuthContext';
import { useInteraction } from './InteractionContext';
import { Octo } from '../types/octo';
import { seedData } from '../utils/seedData';

interface HiveContextType {
  octos: Octo[];
  loading: boolean;
  trendingFilter: 'all' | 'trending' | 'recent';
  setTrendingFilter: (filter: 'all' | 'trending' | 'recent') => void;
  refreshOctos: () => Promise<void>;
}

const HiveContext = createContext<HiveContextType>({
  octos: [],
  loading: true,
  trendingFilter: 'all',
  setTrendingFilter: () => {},
  refreshOctos: async () => {},
});

export const useHive = () => useContext(HiveContext);

export const HiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { getOctos, addOcto, loading: firebaseLoading } = useFirebase();
  const { user } = useAuth();
  const { getOctoStats } = useInteraction();
  const [octos, setOctos] = useState<Octo[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingFilter, setTrendingFilter] = useState<'all' | 'trending' | 'recent'>('all');

  const refreshOctos = async () => {
    try {
      const firestoreOctos = await getOctos();
      
      // Filtrer les octos selon l'utilisateur connecté
      const filteredOctos = firestoreOctos.filter(octo => {
        // Si l'utilisateur n'est pas connecté, ne montrer que les octos publics
        if (!user) {
          return octo.isPublic !== false; // Par défaut public si pas défini
        }
        
        // Si l'utilisateur est connecté, montrer ses octos + les octos publics des autres
        return octo.isPublic !== false || octo.authorId === user.id;
      });
      
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
  }, [firebaseLoading, user, trendingFilter]);

  const value = {
    octos,
    loading,
    trendingFilter,
    setTrendingFilter,
    refreshOctos,
  };

  return (
    <HiveContext.Provider value={value}>
      {children}
    </HiveContext.Provider>
  );
};