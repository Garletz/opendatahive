import { getAllUsersWithUV } from './gunHelpers';

export interface SystemTestResult {
  gunConnection: boolean;
  dataSync: boolean;
  userCount: number;
  errors: string[];
}

export async function runSystemTest(gun: any, userId: string): Promise<SystemTestResult> {
  const result: SystemTestResult = {
    gunConnection: false,
    dataSync: false,
    userCount: 0,
    errors: []
  };

  try {
    // Vérifier que gun est valide
    if (!gun || typeof gun.get !== 'function') {
      result.errors.push('GunDB instance invalide');
      return result;
    }

    // Test 1: Connexion GunDB
    console.log('🧪 Test 1: Connexion GunDB');
    const testKey = 'odh:system-test';
    const testData = { timestamp: Date.now(), userId };
    
    await new Promise<void>((resolve, reject) => {
      try {
        gun.get(testKey).put(testData);
        
        setTimeout(() => {
          gun.get(testKey).once((data: any) => {
            if (data && data.timestamp) {
              result.gunConnection = true;
              console.log('✅ Connexion GunDB: OK');
              resolve();
            } else {
              result.errors.push('Échec de la connexion GunDB - pas de réponse');
              console.log('❌ Connexion GunDB: ÉCHEC');
              reject(new Error('Pas de réponse du serveur'));
            }
          });
        }, 2000); // Augmenté à 2 secondes
      } catch (error) {
        result.errors.push(`Erreur lors du test de connexion: ${error}`);
        reject(error);
      }
    });

    // Test 2: Synchronisation des données
    console.log('🧪 Test 2: Synchronisation des données');
    await new Promise<void>((resolve) => {
      try {
        getAllUsersWithUV(gun, (users) => {
          result.userCount = users.length;
          result.dataSync = true;
          console.log(`✅ Synchronisation: ${users.length} utilisateurs trouvés`);
          resolve();
        });
      } catch (error) {
        result.errors.push(`Erreur lors de la synchronisation: ${error}`);
        resolve();
      }
    });

  } catch (error) {
    result.errors.push(`Erreur générale: ${error}`);
    console.log('❌ Erreur générale:', error);
  }

  return result;
}

export function getSystemStatus(result: SystemTestResult): {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details: string[];
} {
  const details: string[] = [];
  
  if (!result.gunConnection) {
    details.push('❌ Connexion GunDB échouée');
  } else {
    details.push('✅ Connexion GunDB fonctionnelle');
  }
  
  if (!result.dataSync) {
    details.push('❌ Synchronisation des données échouée');
  } else {
    details.push(`✅ Synchronisation OK (${result.userCount} utilisateurs)`);
  }

  const successCount = [result.gunConnection, result.dataSync].filter(Boolean).length;

  let status: 'healthy' | 'warning' | 'error';
  let message: string;

  if (successCount === 2) {
    status = 'healthy';
    message = 'Système entièrement opérationnel';
  } else if (successCount >= 1) {
    status = 'warning';
    message = 'Système partiellement fonctionnel';
  } else {
    status = 'error';
    message = 'Système défaillant';
  }

  return { status, message, details };
} 