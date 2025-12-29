// Gun import removed as it's not used in this file

// Distance hexagonale (pour grille hex)
export function hexDistance(u1: number, v1: number, u2: number, v2: number) {
  return (Math.abs(u1 - u2) + Math.abs(u1 + v1 - u2 - v2) + Math.abs(v1 - v2)) / 2;
}

export async function reserveUV(userId: string, newU: number, newV: number, gun: any, minDist = 3): Promise<string> {
  return new Promise((resolve, reject) => {
    // Vérifier d'abord si l'utilisateur a déjà un point réservé
    gun.get('odh:uv').get(userId).once((existingPoint: any) => {
      if (existingPoint && typeof existingPoint.u === 'number' && typeof existingPoint.v === 'number') {
        reject('Vous avez déjà réservé le point (' + existingPoint.u + ', ' + existingPoint.v + '). Un seul point par utilisateur.');
        return;
      }

      // Si pas de point existant, vérifier la disponibilité du nouveau point
      let collision = false;
      let alreadyTaken = false;
      gun.get('odh:uv').map().once((octo: any, peerId: string) => {
        if (!octo || peerId === userId) return;
        if (octo.u === newU && octo.v === newV) {
          alreadyTaken = true;
        }
        if (hexDistance(octo.u, octo.v, newU, newV) < minDist) {
          collision = true;
        }
      });
      
      setTimeout(() => {
        if (alreadyTaken) return reject('Ce point est déjà pris.');
        if (collision) return reject('Trop proche d\'un autre utilisateur.');
        gun.get('odh:uv').get(userId).put({ u: newU, v: newV, ts: Date.now() });
        resolve('Point réservé avec succès !');
      }, 500);
    });
  });
}

export function listenAllUV(gun: any, callback: (octo: any, userId: string) => void) {
  gun.get('odh:uv').map().on((octo: any, userId: string) => {
    if (octo && octo.u != null && octo.v != null) {
      callback(octo, userId);
    }
  });
}

// Nouvelle fonction pour récupérer tous les utilisateurs avec leurs points UV
export function getAllUsersWithUV(gun: any, callback: (users: Array<{userId: string, u: number, v: number, ts: number}>) => void) {
  const users: Array<{userId: string, u: number, v: number, ts: number}> = [];
  
  console.log('🔍 Début de getAllUsersWithUV');
  
  if (!gun) {
    console.error('❌ GunDB not available');
    callback([]);
    return;
  }

  // Test de connexion d'abord
  const testKey = 'odh:test-connection';
  const testData = { 
    timestamp: Date.now(),
    domain: window.location.hostname,
    test: true
  };
  
  console.log('🧪 Testing GunDB connection before fetching users...');
  gun.get(testKey).put(testData);
  
  setTimeout(() => {
    gun.get(testKey).once((testResponse: any) => {
      if (!testResponse || !testResponse.timestamp) {
        console.error('❌ GunDB connection test failed - cannot fetch users');
        callback([]);
        return;
      }
      
      console.log('✅ GunDB connection test successful, fetching users...');
      
      // Maintenant récupérer les utilisateurs
      gun.get('odh:uv').map().once((octo: any, userId: string) => {
        console.log('📡 Données reçues:', { octo, userId });
        
        if (octo && typeof octo.u === 'number' && typeof octo.v === 'number') {
          const userData = {
            userId,
            u: octo.u,
            v: octo.v,
            ts: octo.ts || Date.now()
          };
          users.push(userData);
          console.log('✅ Utilisateur ajouté:', userData);
        } else {
          console.log('⚠️ Données invalides ignorées:', { octo, userId });
        }
      });
      
      // Attendre plus longtemps pour récupérer toutes les données
      setTimeout(() => {
        console.log(`📊 Callback appelé avec ${users.length} utilisateurs`);
        callback(users);
      }, 4000); // Augmenté à 4 secondes pour plus de fiabilité
    });
  }, 1000);
}

// Génère les offsets pour une spirale hexagonale jusqu'à un certain rayon
function hexSpiralOffsets(maxRadius: number): [number, number][] {
  const results: [number, number][] = [[0, 0]];
  const directions = [
    [1, 0], [0, -1], [-1, -1], [-1, 0], [0, 1], [1, 1]
  ];
  for (let r = 1; r <= maxRadius; r++) {
    let u = 0 + directions[4][0] * r;
    let v = 0 + directions[4][1] * r;
    for (let side = 0; side < 6; side++) {
      for (let step = 0; step < r; step++) {
        results.push([u, v]);
        u += directions[side][0];
        v += directions[side][1];
      }
    }
  }
  return results;
}

// Suggestion automatique d'un point u,v libre
export function suggestUV(allPoints: {u: number, v: number}[], minDist = 3, maxRadius = 20): {u: number, v: number} | null {
  const isValid = (u: number, v: number) => {
    return !allPoints.some(pt =>
      (pt.u === u && pt.v === v) ||
      hexDistance(pt.u, pt.v, u, v) < minDist
    );
  };
  const spiral = hexSpiralOffsets(maxRadius);
  for (const [u, v] of spiral) {
    if (isValid(u, v)) return { u, v };
  }
  return null;
}

// Récupère le point réservé par un utilisateur spécifique
export function getUserUV(gun: any, userId: string, callback: (point: {u: number, v: number} | null) => void) {
  gun.get('odh:uv').get(userId).once((octo: any) => {
    if (octo && typeof octo.u === 'number' && typeof octo.v === 'number') {
      callback({ u: octo.u, v: octo.v });
    } else {
      callback(null);
    }
  });
}

// Supprime la réservation UV d'un utilisateur
export function removeUV(userId: string, gun: any): Promise<string> {
  return new Promise((resolve, reject) => {
    // Vérifier d'abord si l'utilisateur a un point réservé
    gun.get('odh:uv').get(userId).once((existingPoint: any) => {
      if (!existingPoint || typeof existingPoint.u !== 'number' || typeof existingPoint.v !== 'number') {
        reject('Aucun point réservé à supprimer.');
        return;
      }

      // Supprimer la réservation en mettant null
      gun.get('odh:uv').get(userId).put(null);
      
      // Attendre un peu pour confirmer la suppression
      setTimeout(() => {
        gun.get('odh:uv').get(userId).once((data: any) => {
          if (!data) {
            resolve('Point réservé supprimé avec succès !');
          } else {
            reject('Erreur lors de la suppression du point réservé.');
          }
        });
      }, 500);
    });
  });
} 