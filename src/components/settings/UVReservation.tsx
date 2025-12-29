import React, { useState } from 'react';
import { useGun, useAuth } from '@/context';
import { reserveUV, listenAllUV, suggestUV, getUserUV, removeUV } from '@/utils';

export default function UVReservation() {
  const { gun } = useGun();
  const { user } = useAuth(); // user.id = userId
  const [u, setU] = useState('');
  const [v, setV] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [allPoints, setAllPoints] = useState<{u: number, v: number}[]>([]);
  const [myPoint, setMyPoint] = useState<{u: number, v: number} | null>(null);

  // Récupère le point de l'utilisateur actuel
  React.useEffect(() => {
    if (!gun || !user?.id) return;
    getUserUV(gun, user.id, (point) => {
      setMyPoint(point);
    });
  }, [gun, user?.id]);

  // Récupère tous les points existants au montage
  React.useEffect(() => {
    if (!gun) return;
    const points: {u: number, v: number}[] = [];
    listenAllUV(gun, (octo, _userId) => {
      if (octo && typeof octo.u === 'number' && typeof octo.v === 'number') {
        // Évite les doublons
        if (!points.some(pt => pt.u === octo.u && pt.v === octo.v)) {
          points.push({ u: octo.u, v: octo.v });
          setAllPoints([...points]);
        }
      }
    });
  }, [gun]);

  const handleReserve = async () => {
    if (!gun || !user?.id) {
      setStatus('User not connected or GunDB not ready.');
      return;
    }
    setStatus('Checking...');
    setLoading(true);
    try {
      await reserveUV(user.id, parseInt(u), parseInt(v), gun);
      setStatus('✅ Point reserved!');
      // Mettre à jour le point de l'utilisateur
      setMyPoint({ u: parseInt(u), v: parseInt(v) });
    } catch (err) {
      setStatus('❌ ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = () => {
    const suggestion = suggestUV(allPoints, 3, 20);
    if (suggestion) {
      setU(suggestion.u.toString());
      setV(suggestion.v.toString());
      setStatus('Suggestion found!');
    } else {
      setStatus('No free point found around the center.');
    }
  };

  const handleRemove = async () => {
    if (!gun || !user?.id) {
      setStatus('User not connected or GunDB not ready.');
      return;
    }
    setStatus('Deletion in progress...');
    setLoading(true);
    try {
      await removeUV(user.id, gun);
      setStatus('✅ Point deleted!');
      setMyPoint(null);
    } catch (err) {
      setStatus('❌ ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Affichage du point réservé */}
      {myPoint ? (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">✓</span>
            </div>
            <div>
              <h4 className="font-semibold text-green-800">Point reserved</h4>
              <p className="text-sm text-green-600">Your position on the Hive</p>
            </div>
          </div>
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-green-700 mb-1">
              ({myPoint.u}, {myPoint.v})
            </div>
            <p className="text-sm text-green-600">Hexagonal coordinates</p>
          </div>
          <div className="flex justify-center">
            <button 
              onClick={handleRemove} 
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deletion...' : 'Delete my reservation'}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">!</span>
            </div>
            <div>
              <h4 className="font-semibold text-amber-800">No point reserved</h4>
              <p className="text-sm text-amber-600">Reserve your unique position on the Hive</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de réservation - désactivé si déjà un point */}
      {!myPoint && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">U coordinate</label>
              <input 
                type="number" 
                value={u} 
                onChange={e => setU(e.target.value)} 
                placeholder="0" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">V coordinate</label>
              <input 
                type="number" 
                value={v} 
                onChange={e => setV(e.target.value)} 
                placeholder="0" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={handleSuggest}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Suggest a point
            </button>
            <button 
              onClick={handleReserve} 
              disabled={loading || !u || !v} 
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : 'Reserve this point'}
            </button>
          </div>
          
          {status && (
            <div className={`p-3 rounded-lg text-sm font-medium ${
              status.startsWith('✅') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : status.startsWith('❌') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {status}
            </div>
          )}
        </div>
      )}

      {/* Informations sur le système */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h5 className="font-medium text-gray-900 mb-2">About the UV system</h5>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Each user can reserve a unique (U,V) point</li>
          <li>• Points are spaced at least 3 hexagonal units apart</li>
          <li>• Your position is synchronized via GunDB</li>
          <li>• Coordinates are visible on the Hive map</li>
        </ul>
      </div>
    </div>
  );
} 