import React from 'react';

type ViewMode = 'public' | 'personal' | 'projects' | 'all-users' | 'chat';

interface HexSwitchProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  allowReselect?: boolean;
}

const HEX_SIZE = 24;

export const HexSwitch: React.FC<HexSwitchProps> = ({ value, onChange, allowReselect = false }) => {
  // Theme compliant colors
  const colors: Record<ViewMode, string> = {
    public: '#06b6d4',    // cyan-500
    personal: '#10b981',  // emerald-500
    projects: '#f59e0b',  // amber-500
    'all-users': '#3b82f6', // blue-500
    chat: '#8b5cf6',      // violet-500
  };

  const labels: Record<ViewMode, string> = {
    public: 'Public',
    personal: 'My Hive',
    projects: 'My Projects',
    'all-users': 'All Users',
    chat: 'Chat',
  };

  const strokeInactive = 'rgba(255, 255, 255, 0.2)'; // transparent white

  const handleModeChange = (mode: ViewMode) => {
    if (allowReselect || value !== mode) {
      onChange(mode);
    }
  };

  const getHexColor = (mode: ViewMode) => value === mode ? colors[mode] : 'transparent';
  const getStrokeColor = (mode: ViewMode) => value === mode ? colors[mode] : strokeInactive;

  const renderHexButton = (mode: ViewMode) => (
    <button
      key={mode}
      type="button"
      aria-pressed={value === mode}
      aria-label={`Switch to ${labels[mode]}`}
      onClick={() => handleModeChange(mode)}
      className={
        `transition-all duration-300 cursor-pointer group relative ${value === mode ? 'scale-110' : 'opacity-60 hover:opacity-100'}`
      }
      title={labels[mode]}
    >
      <svg width={HEX_SIZE} height={HEX_SIZE} viewBox="0 0 28 28" fill="none" style={{ overflow: 'visible' }}>
        <polygon
          points="14,3 25,9.5 25,20.5 14,27 3,20.5 3,9.5"
          fill={getHexColor(mode)}
          stroke={getStrokeColor(mode)}
          strokeWidth="1.5"
          strokeLinejoin="round"
          style={{ transition: 'all 0.3s' }}
        />
      </svg>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
        {labels[mode]}
      </div>
    </button>
  );

  const modes: ViewMode[] = ['public', 'personal', 'projects', 'all-users', 'chat'];

  return (
    <div className="flex items-center gap-2">
      {modes.map(renderHexButton)}
    </div>
  );
};

export default HexSwitch;