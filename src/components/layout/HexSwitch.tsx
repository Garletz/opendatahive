import React from 'react';

interface HexSwitchProps {
  value: 'public' | 'personal' | 'all-users' | 'chat';
  onChange: (value: 'public' | 'personal' | 'all-users' | 'chat') => void;
  allowReselect?: boolean;
}

const HEX_SIZE = 24;

export const HexSwitch: React.FC<HexSwitchProps> = ({ value, onChange, allowReselect = false }) => {
  // Theme compliant colors (Cyan instead of Amber/Yellow/Purple)
  const colorActive = '#06b6d4'; // cyan-500
  const strokeActive = '#06b6d4';
  const strokeInactive = '#475569'; // slate-600
  const colorAllUsers = '#3b82f6'; // blue-500
  const colorChat = '#8b5cf6'; // violet-500

  const handleModeChange = (mode: 'public' | 'personal' | 'all-users' | 'chat') => {
    if (allowReselect || value !== mode) {
      onChange(mode);
    }
  };

  const getHexColor = (mode: 'public' | 'personal' | 'all-users' | 'chat') => {
    if (value === mode) {
      if (mode === 'chat') return colorChat;
      if (mode === 'all-users') return colorAllUsers;
      if (mode === 'personal') return '#10b981'; // emerald-500 for personal
      return colorActive;
    }
    return 'none';
  };

  const getStrokeColor = (mode: 'public' | 'personal' | 'all-users' | 'chat') => {
    if (value === mode) {
      if (mode === 'chat') return colorChat;
      if (mode === 'all-users') return colorAllUsers;
      if (mode === 'personal') return '#10b981';
      return strokeActive;
    }
    return strokeInactive;
  };

  const getFilter = (mode: 'public' | 'personal' | 'all-users' | 'chat') => {
    if (value === mode) {
      const color = mode === 'chat' ? colorChat : (mode === 'all-users' ? colorAllUsers : (mode === 'personal' ? '#10b981' : colorActive));
      return `drop-shadow(0 0 8px ${color}88)`;
    }
    return 'none';
  };

  return (
    <div className="flex items-center gap-2">
      {/* Public hexagon */}
      <button
        type="button"
        aria-pressed={value === 'public'}
        aria-label="Switch to public view"
        onClick={() => handleModeChange('public')}
        className={
          `transition-all duration-300 cursor-pointer group relative ${value === 'public' ? 'scale-110' : 'opacity-60 hover:opacity-100'}`
        }
        title="Public"
      >
        <svg width={HEX_SIZE} height={HEX_SIZE} viewBox="0 0 28 28" fill="none">
          <polygon
            points="14,2 26,9 26,21 14,28 2,21 2,9"
            fill={getHexColor('public')}
            stroke={getStrokeColor('public')}
            strokeWidth="2.5"
            strokeLinejoin="round"
            style={{ filter: getFilter('public'), transition: 'all 0.3s' }}
          />
        </svg>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
          Public
        </div>
      </button>

      {/* My Hive hexagon */}
      <button
        type="button"
        aria-pressed={value === 'personal'}
        aria-label="Switch to My Hive"
        onClick={() => handleModeChange('personal')}
        className={
          `transition-all duration-300 cursor-pointer group relative ${value === 'personal' ? 'scale-110' : 'opacity-60 hover:opacity-100'}`
        }
        title="My Hive"
      >
        <svg width={HEX_SIZE} height={HEX_SIZE} viewBox="0 0 28 28" fill="none">
          <polygon
            points="14,2 26,9 26,21 14,28 2,21 2,9"
            fill={getHexColor('personal')}
            stroke={getStrokeColor('personal')}
            strokeWidth="2.5"
            strokeLinejoin="round"
            style={{ filter: getFilter('personal'), transition: 'all 0.3s' }}
          />
        </svg>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
          My Hive
        </div>
      </button>

      {/* All Users hexagon */}
      <button
        type="button"
        aria-pressed={value === 'all-users'}
        aria-label="Switch to All Users view"
        onClick={() => handleModeChange('all-users')}
        className={
          `transition-all duration-300 cursor-pointer group relative ${value === 'all-users' ? 'scale-110' : 'opacity-60 hover:opacity-100'}`
        }
        title="All Users"
      >
        <svg width={HEX_SIZE} height={HEX_SIZE} viewBox="0 0 28 28" fill="none">
          <polygon
            points="14,2 26,9 26,21 14,28 2,21 2,9"
            fill={getHexColor('all-users')}
            stroke={getStrokeColor('all-users')}
            strokeWidth="2.5"
            strokeLinejoin="round"
            style={{ filter: getFilter('all-users'), transition: 'all 0.3s' }}
          />
        </svg>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
          All Users
        </div>
      </button>

      {/* Chat / Architect hexagon */}
      <button
        type="button"
        aria-pressed={value === 'chat'}
        aria-label="Switch to Architect Chat"
        onClick={() => handleModeChange('chat')}
        className={
          `transition-all duration-300 cursor-pointer group relative ${value === 'chat' ? 'scale-110' : 'opacity-60 hover:opacity-100'}`
        }
        title="Chat"
      >
        <svg width={HEX_SIZE} height={HEX_SIZE} viewBox="0 0 28 28" fill="none">
          <polygon
            points="14,2 26,9 26,21 14,28 2,21 2,9"
            fill={getHexColor('chat')}
            stroke={getStrokeColor('chat')}
            strokeWidth="2.5"
            strokeLinejoin="round"
            style={{ filter: getFilter('chat'), transition: 'all 0.3s' }}
          />
          {/* Optional: Add a simple icon inside or just use color */}
        </svg>
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
          Chat
        </div>
      </button>
    </div>
  );
};

export default HexSwitch;