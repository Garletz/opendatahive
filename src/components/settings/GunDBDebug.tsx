import React, { useState } from 'react';
import { useGun } from '@/context';
import { getAllUsersWithUV } from '@/utils/gunHelpers';
import { Wifi, WifiOff, AlertCircle, RefreshCw, Users, Server, Clock } from 'lucide-react';

export default function GunDBDebug() {
  const { gun, isConnected, connectionError, retryConnection, lastPing, connectionAttempts } = useGun();
  const [userCount, setUserCount] = useState<number | null>(null);
  const [isTestingUsers, setIsTestingUsers] = useState(false);
  const [isTestingServer, setIsTestingServer] = useState(false);
  const [serverTestResult, setServerTestResult] = useState<string>('');

  const handleTestUsers = async () => {
    if (!gun) return;
    
    setIsTestingUsers(true);
    try {
      getAllUsersWithUV(gun, (users) => {
        setUserCount(users.length);
        console.log('👥 Users found:', users.length);
      });
    } catch (error) {
      console.error('❌ Error testing users:', error);
    } finally {
      setIsTestingUsers(false);
    }
  };

  const handleTestServer = async () => {
    setIsTestingServer(true);
    try {
      const response = await fetch('https://d6366f75-5daf-420f-b72a-f21a54fc16e8-00-3ue8td7peq8oj.kirk.replit.dev/health');
      const data = await response.json();
      setServerTestResult(JSON.stringify(data, null, 2));
      console.log('✅ Server test successful:', data);
    } catch (error) {
      setServerTestResult(`Error: ${error}`);
      console.error('❌ Server test failed:', error);
    } finally {
      setIsTestingServer(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-blue-100">
          <Server className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">GunDB Debug Panel</h3>
          <p className="text-sm text-gray-600">Diagnostic complet de la connexion GunDB</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Informations de base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className={`h-4 w-4 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
              <span className="font-medium">Statut de connexion</span>
            </div>
            <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </p>
            {connectionError && (
              <p className="text-xs text-red-500 mt-1">{connectionError}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Dernier ping</span>
            </div>
            <p className="text-sm text-gray-600">
              {lastPing ? lastPing.toLocaleTimeString() : 'Jamais'}
            </p>
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Informations détaillées</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Domaine actuel:</span>
              <span className="font-mono">{window.location.hostname}</span>
            </div>
            <div className="flex justify-between">
              <span>Protocole:</span>
              <span className="font-mono">{window.location.protocol}</span>
            </div>
            <div className="flex justify-between">
              <span>Tentatives de connexion:</span>
              <span className="font-mono">{connectionAttempts}</span>
            </div>
            <div className="flex justify-between">
              <span>Instance GunDB:</span>
              <span className="font-mono">{gun ? 'Disponible' : 'Non disponible'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={retryConnection}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
          
          <button
            onClick={handleTestUsers}
            disabled={isTestingUsers || !gun}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            <Users className="h-4 w-4" />
            {isTestingUsers ? 'Testing...' : 'Test Users'}
          </button>
          
          <button
            onClick={handleTestServer}
            disabled={isTestingServer}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            <Server className="h-4 w-4" />
            {isTestingServer ? 'Testing...' : 'Test Server'}
          </button>
        </div>

        {/* Résultats des tests */}
        {userCount !== null && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="font-medium">Test des utilisateurs</span>
            </div>
            <p className="text-sm text-green-700">
              {userCount} utilisateurs trouvés
            </p>
          </div>
        )}

        {serverTestResult && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Test du serveur</span>
            </div>
            <pre className="text-xs text-purple-700 bg-purple-100 p-2 rounded overflow-auto">
              {serverTestResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 