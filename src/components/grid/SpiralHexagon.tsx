import React from 'react';
import { motion } from 'framer-motion';
import { Database, Link as LinkIcon } from 'lucide-react';
import { Hex } from 'honeycomb-grid';
import { Octo } from '../../types/octo';
import { useInteraction } from '../../context/InteractionContext';

interface SpiralHexagonProps {
  hex: Hex;
  octo?: Octo;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isSelected?: boolean;
}

const SpiralHexagon: React.FC<SpiralHexagonProps> = ({ 
  hex, 
  octo, 
  onClick, 
  onMouseEnter, 
  onMouseLeave,
  isSelected = false
}) => {
  const { trackInteraction } = useInteraction();
  const width = 120;
  const height = 130;
  const contentWidth = 0.7 * width;

  // Function to get format-specific gradient colors
  const getFormatGradient = (format: string) => {
    switch (format) {
      case 'JSON': return 'from-blue-500 to-blue-600';
      case 'CSV': return 'from-green-500 to-green-600';
      case 'XML': return 'from-purple-500 to-purple-600';
      case 'API': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // Create hexagon points
  const radius = width / 2;
  const hexPoints = Array(6)
    .fill(0)
    .map((_, i) => {
      const angle = ((2 * Math.PI) / 6) * i - Math.PI / 6;
      return `${radius * Math.cos(angle)},${radius * Math.sin(angle)}`;
    })
    .join(' ');

  const handleClick = () => {
    if (octo) {
      // Enregistrer l'interaction de clic
      trackInteraction(octo.id, 'click', { source: 'hexagon_grid' });
    }
    if (onClick) {
      onClick();
    }
  };

  const handleMouseEnter = () => {
    if (octo) {
      // Enregistrer l'interaction de vue
      trackInteraction(octo.id, 'view', { source: 'hexagon_grid' });
    }
    if (onMouseEnter) {
      onMouseEnter();
    }
  };

  return (
    <g
      transform={`translate(${hex.x},${hex.y})`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Shadow/Depth Layer */}
      <motion.polygon
        points={hexPoints}
        fill="rgba(0,0,0,0.1)"
        transform="translate(2, 4)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Main Hexagon with Gradient */}
      <motion.polygon
        points={hexPoints}
        fill={octo ? "url(#hexGradient)" : "url(#emptyHexGradient)"}
        stroke={isSelected ? "#FF6B35" : octo ? "#FFC107" : "#E0E0E0"}
        strokeWidth={isSelected ? "4" : "2"}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={octo ? { 
          scale: 1.08, 
          stroke: "#FFB300",
          filter: "drop-shadow(0 8px 16px rgba(255, 193, 7, 0.3))"
        } : undefined}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 20 
        }}
        style={{
          filter: octo ? "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
        }}
      />
      
      {/* Selection Ring for Keyboard Mode */}
      {isSelected && (
        <motion.polygon
          points={hexPoints}
          fill="none"
          stroke="#FF6B35"
          strokeWidth="6"
          strokeDasharray="10,5"
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
            filter: "drop-shadow(0 0 10px rgba(255, 107, 53, 0.5))"
          }}
        />
      )}

      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="100%" stopColor="rgba(248,250,252,0.9)" />
        </linearGradient>
        <linearGradient id="emptyHexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(249,250,251,0.8)" />
          <stop offset="100%" stopColor="rgba(243,244,246,0.6)" />
        </linearGradient>
      </defs>

      {octo ? (
        <foreignObject x={-contentWidth/2} y={-height/2 + 10} width={contentWidth} height={height-20}>
          <motion.div
            className="flex flex-col items-center justify-between h-full w-full text-center overflow-hidden p-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {/* Format Badge with Gradient */}
            <motion.div
              className={`rounded-full text-xs text-white font-bold mb-2 bg-gradient-to-br ${getFormatGradient(octo.format)} shadow-lg`}
              style={{
                minWidth: 40,
                minHeight: 40,
                maxWidth: 50,
                maxHeight: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
                letterSpacing: '0.5px',
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
              title={octo.format}
            >
              {octo.format}
            </motion.div>

            {/* Title with Better Typography */}
            <motion.div
              className="font-heading font-bold text-sm text-gray-800 leading-tight mb-1"
              style={{
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                minHeight: '2.2em',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
              whileHover={{ scale: 1.02 }}
              title={octo.title}
            >
              {octo.title}
              {octo.stats?.trending && (
                <span className="ml-1 text-orange-500">🔥</span>
              )}
            </motion.div>

            {/* Description */}
            <div
              className="text-xs text-gray-600 leading-tight mb-2"
              style={{
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                minHeight: '2.2em',
              }}
              title={octo.description}
            >
              {octo.description}
            </div>

            {/* View Count */}
            {octo.viewCount !== undefined && octo.viewCount > 0 && (
              <div className="text-xs text-white/70 mb-1 text-center">
                👁️ {octo.viewCount} views
              </div>
            )}

            {/* Tags with Modern Design */}
            <div className="flex flex-wrap justify-center gap-1 w-full mb-2">
              {octo.tags.slice(0, 2).map((tag, index) => (
                <motion.span
                  key={tag}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full border border-gray-300 shadow-sm"
                  style={{
                    maxWidth: 35,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '9px',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.1)',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  title={tag}
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            {/* Icons with Enhanced Styling */}
            <motion.div 
              className="flex justify-center space-x-3 mt-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.span 
                className="text-blue-500 flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 shadow-sm"
                whileHover={{ scale: 1.2, backgroundColor: '#dbeafe' }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Database size={12} />
              </motion.span>
              <motion.span 
                className="text-green-500 flex items-center justify-center w-6 h-6 rounded-full bg-green-50 shadow-sm"
                whileHover={{ scale: 1.2, backgroundColor: '#dcfce7' }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <LinkIcon size={12} />
              </motion.span>
            </motion.div>
          </motion.div>
        </foreignObject>
      ) : null}
    </g>
  );
};

export default SpiralHexagon;