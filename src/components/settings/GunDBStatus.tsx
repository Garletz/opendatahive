import { useState, useEffect } from 'react';
import { useGun } from '@/context';
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';

export default function GunDBStatus() {
  const { gun, isConnected, connectionError, retryConnection } = useGun();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (isConnected) {
      setLastUpdate(new Date());
    }
  }, [isConnected]);

  const getStatusColor = () => {
    if (isConnected) {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (connectionError) {
      return 'text-red-600 bg-red-50 border-red-200';
    } else {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusIcon = () => {
    if (isConnected) {
      return <Wifi className="h-5 w-5" />;
    } else if (connectionError) {
      return <WifiOff className="h-5 w-5" />;
    } else {
      return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getStatusText = () => {
    if (isConnected) {
      return 'Connected to GunDB network';
    } else if (connectionError) {
      return 'Connection error';
    } else {
      return 'Connecting...';
    }
  };

  const getStatusDetails = () => {
    if (connectionError) {
      return connectionError;
    } else if (isConnected) {
      return 'Real-time data synchronization active';
    } else {
      return 'Attempting to connect to GunDB relay...';
    }
  };

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-3 p-4 rounded-lg border ${getStatusColor()}`}>
        {getStatusIcon()}
        <div className="flex-1">
          <div className="font-medium">{getStatusText()}</div>
          <div className="text-sm opacity-75">
            {getStatusDetails()}
          </div>
          {lastUpdate && isConnected && (
            <div className="text-sm opacity-75">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 
            connectionError ? 'bg-red-500' : 
            'bg-yellow-500'
          }`}></div>
          <button
            onClick={retryConnection}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Retry connection"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h5 className="font-medium text-gray-900 mb-2">GunDB Information</h5>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Decentralized peer-to-peer database</li>
          <li>• Real-time synchronization</li>
          <li>• Data shared among all users</li>
          <li>• Relay: Replit (d6366f75-5daf-420f-b72a-f21a54fc16e8-00-3ue8td7peq8oj.kirk.replit.dev)</li>
          <li>• Optimized for Cloudflare Pages</li>
        </ul>
      </div>

      {connectionError && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h5 className="font-medium text-red-900 mb-2">Connection Error</h5>
          <p className="text-sm text-red-700">{connectionError}</p>
          <p className="text-xs text-red-600 mt-2">
            This may be due to network restrictions on Cloudflare Pages. 
            The connection should work from localhost.
          </p>
        </div>
      )}
    </div>
  );
} 