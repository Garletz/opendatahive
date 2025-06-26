import React from 'react';

const MiniBountyBoardIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <div className={`${className} relative flex items-center justify-center`}>
      {/* Wooden frame */}
      <div className="w-full h-full bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg border-2 border-amber-800 shadow-inner relative overflow-hidden">
        {/* Wood grain effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
        
        {/* Title panel */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 border border-amber-800 rounded-sm px-1 py-0.5 text-xs font-bold text-amber-900 shadow-sm">
          <div className="w-3 h-0.5 bg-amber-900 rounded"></div>
        </div>
        
        {/* Small papers */}
        <div className="absolute inset-1 flex flex-wrap gap-0.5 items-start justify-start pt-1">
          {/* Paper 1 */}
          <div 
            className="w-2 h-2.5 bg-yellow-50 border border-yellow-200 rounded-sm shadow-sm transform rotate-6"
            style={{ fontSize: '4px' }}
          >
            <div className="w-full h-0.5 bg-yellow-200 rounded-t-sm"></div>
            <div className="p-0.5 space-y-0.5">
              <div className="w-full h-0.5 bg-gray-300 rounded"></div>
              <div className="w-3/4 h-0.5 bg-gray-300 rounded"></div>
            </div>
          </div>
          
          {/* Paper 2 */}
          <div 
            className="w-2 h-2.5 bg-yellow-50 border border-yellow-200 rounded-sm shadow-sm transform -rotate-3"
            style={{ fontSize: '4px' }}
          >
            <div className="w-full h-0.5 bg-green-200 rounded-t-sm"></div>
            <div className="p-0.5 space-y-0.5">
              <div className="w-full h-0.5 bg-gray-300 rounded"></div>
              <div className="w-2/3 h-0.5 bg-gray-300 rounded"></div>
            </div>
          </div>
          
          {/* Paper 3 */}
          <div 
            className="w-2 h-2.5 bg-yellow-50 border border-yellow-200 rounded-sm shadow-sm transform rotate-2"
            style={{ fontSize: '4px' }}
          >
            <div className="w-full h-0.5 bg-blue-200 rounded-t-sm"></div>
            <div className="p-0.5 space-y-0.5">
              <div className="w-full h-0.5 bg-gray-300 rounded"></div>
              <div className="w-4/5 h-0.5 bg-gray-300 rounded"></div>
            </div>
          </div>
          
          {/* Paper 4 */}
          <div 
            className="w-2 h-2.5 bg-yellow-50 border border-yellow-200 rounded-sm shadow-sm transform -rotate-1"
            style={{ fontSize: '4px' }}
          >
            <div className="w-full h-0.5 bg-red-200 rounded-t-sm"></div>
            <div className="p-0.5 space-y-0.5">
              <div className="w-full h-0.5 bg-gray-300 rounded"></div>
              <div className="w-3/5 h-0.5 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Decorative pins */}
        <div className="absolute top-0.5 left-1 w-0.5 h-0.5 bg-amber-900 rounded-full"></div>
        <div className="absolute top-0.5 right-1 w-0.5 h-0.5 bg-amber-900 rounded-full"></div>
      </div>
      
      {/* Prominent vine decoration that passes over the entire icon */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <svg viewBox="0 0 40 40" className="w-full h-full">
          {/* Main vine path crossing diagonally */}
          <path 
            d="M5,8 Q12,4 20,8 Q28,12 35,8" 
            stroke="#4e8c3a" 
            strokeWidth="2" 
            fill="none"
            opacity="0.9"
          />
          {/* Secondary vine path */}
          <path 
            d="M8,32 Q15,28 23,32 Q31,36 38,32" 
            stroke="#4e8c3a" 
            strokeWidth="1.5" 
            fill="none"
            opacity="0.8"
          />
          
          {/* Leaves along the vines */}
          <ellipse cx="12" cy="6" rx="2" ry="1.2" fill="#6fcf5b" opacity="0.9"/>
          <ellipse cx="20" cy="8" rx="2.2" ry="1.4" fill="#6fcf5b" opacity="0.9"/>
          <ellipse cx="28" cy="10" rx="1.8" ry="1.1" fill="#6fcf5b" opacity="0.9"/>
          
          <ellipse cx="15" cy="30" rx="1.6" ry="1" fill="#6fcf5b" opacity="0.8"/>
          <ellipse cx="23" cy="32" rx="2" ry="1.3" fill="#6fcf5b" opacity="0.8"/>
          <ellipse cx="31" cy="34" rx="1.7" ry="1.1" fill="#6fcf5b" opacity="0.8"/>
          
          {/* Small decorative flowers */}
          <circle cx="16" cy="7" r="1" fill="#ffeb3b" opacity="0.7"/>
          <circle cx="25" cy="31" r="0.8" fill="#ffeb3b" opacity="0.7"/>
        </svg>
      </div>
    </div>
  );
};

export default MiniBountyBoardIcon;