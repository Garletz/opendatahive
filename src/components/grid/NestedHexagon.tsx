import React from 'react';
import { motion } from 'framer-motion';
import { Hex } from 'honeycomb-grid';
import { Octo } from '../../types/octo';
import { useModal } from '../../context/ModalContext';

interface NestedHexagonProps {
  hex: Hex;
  octos: Octo[];
  onClick?: (octo: Octo) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isSelected?: boolean;
}

const NestedHexagon: React.FC<NestedHexagonProps> = ({ 
  hex, 
  octos, 
  onClick, 
  onMouseEnter, 
  onMouseLeave,
  isSelected = false
}) => {
  const { openDetailModal } = useModal();
  const width = 120;
  
  const n = 6;
  const s = 2;
  const hexSizePx = width / (2 * n);
  const centerX = 0;
  const centerY = 0;

  const axialCoords = [
    {q: 0, r: 0},
    {q: 2, r: 0},
    {q: -2, r: 2},
    {q: 0, r: 2},
    {q: 2, r: -2},
    {q: -2, r: 0},
    {q: 0, r: -2}
  ];

  // Modern gradient colors
  const nestedGradients = [
    'from-red-400 to-red-600',
    'from-blue-400 to-blue-600', 
    'from-green-400 to-green-600',
    'from-yellow-400 to-yellow-600',
    'from-purple-400 to-purple-600',
    'from-teal-400 to-teal-600',
    'from-orange-400 to-orange-600'
  ];

  const bigHexPoints = Array(6)
    .fill(0)
    .map((_, i) => {
      const angle = ((2 * Math.PI) / 6) * i - Math.PI / 6;
      return `${centerX + n * hexSizePx * Math.cos(angle)},${centerY + n * hexSizePx * Math.sin(angle)}`;
    })
    .join(' ');

  const handleHexClick = (octo: Octo) => {
    if (onClick) {
      onClick(octo);
    } else {
      openDetailModal(octo);
    }
  };

  return (
    <g 
      transform={`translate(${hex.x},${hex.y})`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Shadow for main hexagon */}
      <polygon
        points={bigHexPoints}
        fill="rgba(0,0,0,0.1)"
        transform="translate(3, 5)"
      />
      
      {/* Main hexagon with gradient */}
      <motion.polygon
        points={bigHexPoints}
        fill="url(#nestedMainGradient)"
        stroke={isSelected ? "#FF6B35" : "#FFC107"}
        strokeWidth={isSelected ? "5" : "3"}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          filter: "drop-shadow(0 6px 12px rgba(255, 193, 7, 0.3))"
        }}
      />

      {/* Selection Ring for Keyboard Mode */}
      {isSelected && (
        <motion.polygon
          points={bigHexPoints}
          fill="none"
          stroke="#FF6B35"
          strokeWidth="8"
          strokeDasharray="15,8"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: [0.7, 1, 0.7], 
            scale: [1.1, 1.15, 1.1],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            filter: "drop-shadow(0 0 15px rgba(255, 107, 53, 0.5))"
          }}
        />
      )}

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="nestedMainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="50%" stopColor="rgba(255,248,225,0.9)" />
          <stop offset="100%" stopColor="rgba(254,243,199,0.85)" />
        </linearGradient>
        {nestedGradients.map((gradient, i) => (
          <linearGradient key={i} id={`nestedGrad${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`var(--tw-gradient-from)`} />
            <stop offset="100%" stopColor={`var(--tw-gradient-to)`} />
          </linearGradient>
        ))}
      </defs>

      {/* Nested hexagons */}
      {axialCoords.map((coord, i) => {
        const x = centerX + hexSizePx * Math.sqrt(3) * (coord.q + coord.r/2);
        const y = centerY + hexSizePx * 1.5 * coord.r;
        const points = Array(6)
          .fill(0)
          .map((_, j) => {
            const angle = ((2 * Math.PI) / 6) * j - Math.PI / 6;
            return `${x + s * hexSizePx * Math.cos(angle)},${y + s * hexSizePx * Math.sin(angle)}`;
          })
          .join(' ');
        
        const octo = octos.find(o => o.position === i);
        
        return (
          <motion.g 
            key={`nested-${i}`}
            onClick={() => octo && handleHexClick(octo)}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 400 }}
            whileHover={octo ? { scale: 1.15 } : undefined}
          >
            {/* Shadow for nested hexagon */}
            <polygon
              points={points}
              fill="rgba(0,0,0,0.15)"
              transform="translate(1, 2)"
            />
            
            {/* Nested hexagon with modern gradient */}
            <polygon
              points={points}
              fill={`url(#grad${i})`}
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="1.5"
              style={{
                filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.2))"
              }}
            />
            
            {/* Gradient definition for this hexagon */}
            <defs>
              <linearGradient id={`grad${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={getGradientColor(i, 'from')} />
                <stop offset="100%" stopColor={getGradientColor(i, 'to')} />
              </linearGradient>
            </defs>
            
            {octo && (
              <foreignObject 
                x={x - 28} 
                y={y - 28} 
                width={56} 
                height={56}
                className="pointer-events-none"
              >
                <motion.div 
                  className="w-full h-full flex flex-col items-center justify-center text-center p-1 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <h3 className="font-heading font-bold text-xs text-white drop-shadow-lg line-clamp-2 mb-1">
                    {octo.title}
                  </h3>
                  <p className="text-xs text-white/90 drop-shadow line-clamp-1 mb-1">
                    {octo.description}
                  </p>
                  <div className="flex justify-center">
                    {octo.tags.slice(0, 1).map(tag => (
                      <span 
                        key={tag} 
                        className="bg-white/20 backdrop-blur-sm text-white text-xs px-1.5 py-0.5 rounded-full border border-white/30 shadow-sm"
                        style={{ fontSize: '8px' }}
                      >
                        {tag.slice(0, 6)}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </foreignObject>
            )}
          </motion.g>
        );
      })}
    </g>
  );
};

// Helper function to get gradient colors
const getGradientColor = (index: number, position: 'from' | 'to') => {
  const colors = [
    { from: '#ef4444', to: '#dc2626' }, // red
    { from: '#3b82f6', to: '#2563eb' }, // blue
    { from: '#10b981', to: '#059669' }, // green
    { from: '#f59e0b', to: '#d97706' }, // yellow
    { from: '#8b5cf6', to: '#7c3aed' }, // purple
    { from: '#14b8a6', to: '#0d9488' }, // teal
    { from: '#f97316', to: '#ea580c' }, // orange
  ];
  
  return colors[index % colors.length][position];
};

export default NestedHexagon;