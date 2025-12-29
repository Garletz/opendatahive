import React, { createContext, useContext, useMemo, useState, useEffect, useRef } from 'react';
import Gun, { IGunInstance } from 'gun';
import 'gun/sea';
import 'gun/lib/webrtc';

interface GunContextType {
  gun: IGunInstance | null;
  isConnected: boolean;
  connectionError: string | null;
  retryConnection: () => void;
  lastPing: Date | null;
  connectionAttempts: number;
}

const GunContext = createContext<GunContextType>({
  gun: null,
  isConnected: false,
  connectionError: null,
  retryConnection: () => {},
  lastPing: null,
  connectionAttempts: 0
});

export const GunProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [gun, setGun] = useState<IGunInstance | null>(null);
  const [lastPing, setLastPing] = useState<Date | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  const connectionCheckRef = useRef<NodeJS.Timeout | null>(null);
  const gunInstanceRef = useRef<IGunInstance | null>(null);

  const initializeGun = () => {
    try {
      console.log('🚀 Initializing GunDB for OpenDataHive...');
      console.log('📍 Current domain:', window.location.hostname);
      console.log('🌐 Protocol:', window.location.protocol);
      
      // Configuration optimisée pour Cloudflare Pages
      const gunInstance = Gun({
        peers: [
          'https://d6366f75-5daf-420f-b72a-f21a54fc16e8-00-3ue8td7peq8oj.kirk.replit.dev/gun'
        ],
        localStorage: false, // Désactiver localStorage pour éviter les problèmes CSP
        axe: false, // Désactiver axe pour réduire les problèmes de réseau
        multicast: false, // Désactiver multicast pour éviter les problèmes de réseau
        radisk: false, // Désactiver radisk pour éviter les problèmes de stockage
        retry: 5, // Augmenter le nombre de tentatives
        timeout: 15000 // Augmenter le timeout à 15 secondes
      });

      gunInstanceRef.current = gunInstance;
      setGun(gunInstance);
      
      // Test de connexion initial
      testConnection(gunInstance);
      
      // Démarrer le monitoring continu
      startConnectionMonitoring();
      
      // Exposer gun globalement pour debug
      (window as any).gun = gunInstance;
      
    } catch (error) {
      console.error('❌ Error initializing GunDB:', error);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
      setIsConnected(false);
      setConnectionAttempts(prev => prev + 1);
    }
  };

  const testConnection = (gunInstance: IGunInstance) => {
    const testKey = 'odh:connection-test';
    const testData = { 
      timestamp: Date.now(), 
      domain: window.location.hostname,
      userAgent: navigator.userAgent,
      protocol: window.location.protocol,
      attempt: connectionAttempts + 1
    };
    
    console.log('🧪 Testing GunDB connection from:', window.location.hostname, 'Attempt:', connectionAttempts + 1);
    gunInstance.get(testKey).put(testData);
    
    // Attendre la réponse avec timeout
    const timeout = setTimeout(() => {
      if (!isConnected) {
        setConnectionError('Connection timeout - server may be unreachable');
        console.error('❌ GunDB connection timeout');
        setConnectionAttempts(prev => prev + 1);
      }
    }, 12000);

    gunInstance.get(testKey).once((data: any) => {
      clearTimeout(timeout);
      if (data && data.timestamp) {
        setIsConnected(true);
        setConnectionError(null);
        setLastPing(new Date());
        console.log('✅ GunDB connected successfully from:', window.location.hostname);
      } else {
        setIsConnected(false);
        setConnectionError('Failed to connect to GunDB server - no valid response');
        console.warn('⚠️ GunDB connection failed - no valid response');
        setConnectionAttempts(prev => prev + 1);
      }
    });
  };

  const startConnectionMonitoring = () => {
    // Nettoyer l'ancien intervalle s'il existe
    if (connectionCheckRef.current) {
      clearInterval(connectionCheckRef.current);
    }

    // Démarrer le monitoring continu
    connectionCheckRef.current = setInterval(() => {
      if (gunInstanceRef.current) {
        console.log('🔍 Monitoring GunDB connection...');
        testConnection(gunInstanceRef.current);
      }
    }, 30000); // Vérifier toutes les 30 secondes
  };

  const retryConnection = () => {
    console.log('🔄 Retrying GunDB connection...');
    setIsConnected(false);
    setConnectionError(null);
    setConnectionAttempts(prev => prev + 1);
    
    // Nettoyer l'ancien monitoring
    if (connectionCheckRef.current) {
      clearInterval(connectionCheckRef.current);
    }
    
    // Réinitialiser GunDB
    initializeGun();
  };

  useEffect(() => {
    initializeGun();
    
    // Cleanup à la destruction du composant
    return () => {
      if (connectionCheckRef.current) {
        clearInterval(connectionCheckRef.current);
      }
    };
  }, []);

  return (
    <GunContext.Provider value={{ 
      gun, 
      isConnected, 
      connectionError, 
      retryConnection,
      lastPing,
      connectionAttempts
    }}>
      {children}
    </GunContext.Provider>
  );
};

export const useGun = () => useContext(GunContext); 