import React, { useEffect, useState, useRef, useMemo, memo, forwardRef, useImperativeHandle } from 'react';
import { defineHex, Grid, Hex } from 'honeycomb-grid';
import { motion, AnimatePresence } from 'framer-motion';
import { Octo } from '../../types/octo';
import SpiralHexagon from './SpiralHexagon';
import { useModal } from '../../context/ModalContext';
import { useSearch } from '../../context/SearchContext';
import { useHive } from '../../context/HiveContext';
import NestedHexagon from './NestedHexagon';
import { ZoomIn, ZoomOut, RotateCcw, Globe } from 'lucide-react';
import { Move, Target, Keyboard } from 'lucide-react';
import NestedOctoForm from './NestedOctoForm';
import HexSphere3D from './HexSphere3D';

interface SpiralHexGridProps {
  octos: Octo[];
  controlledVisibleCount?: number;
}

const HEX_COUNT = 500;
const ANIMATION_DELAY = 3; // Reduced for faster loading

const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;

const HexFactory = defineHex({
  dimensions: { width: 120, height: 130 },
  origin: 'topLeft',
});

const SpiralHexGrid = forwardRef<any, SpiralHexGridProps>((props, ref) => {
  const { octos, controlledVisibleCount } = props;
  const { openDetailModal } = useModal();
  const { searchTerm, selectedTags, selectedFormat, selectedAccess } = useSearch();
  const { octos: hiveOctos } = useHive();
  const [showNestedForm, setShowNestedForm] = useState(false);
  const [viewMode, setViewMode] = useState<'free' | 'centered' | 'keyboard'>('free');
  const [selectedOctoIndex, setSelectedOctoIndex] = useState<number | null>(null);

  const generateSpiralPositions = (max: number) => {
    const directions = [
      { q: 1, r: 0 },
      { q: 1, r: -1 },
      { q: 0, r: -1 },
      { q: -1, r: 0 },
      { q: -1, r: 1 },
      { q: 0, r: 1 },
    ];
    const hexes: Array<{ q: number; r: number }> = [];
    let q = 0, r = 0;
    hexes.push({ q, r });
    let layer = 1;
    while (hexes.length < max) {
      q += directions[4].q;
      r += directions[4].r;
      for (let side = 0; side < 6; side++) {
        for (let step = 0; step < layer; step++) {
          if (hexes.length >= max) break;
          hexes.push({ q, r });
          q += directions[side].q;
          r += directions[side].r;
        }
      }
      layer++;
    }
    return hexes;
  };

  const spiralPositions = useRef(generateSpiralPositions(HEX_COUNT));
  const [internalVisibleCount, setInternalVisibleCount] = useState(1);
  const visibleCount = typeof controlledVisibleCount === 'number' ? controlledVisibleCount : internalVisibleCount;
  const [hexPositions, setHexPositions] = useState<Array<{ hex: Hex; octo?: Octo }>>([]);

  const filteredOctos = useMemo(() => {
    return octos.filter(octo => {
      if (octo.isNested && octo.parentId) {
        const parentOcto = octos.find(o => o.id === octo.parentId);
        if (parentOcto) {
          return true;
        }
      }

      const matchesSearch = searchTerm === '' || 
        octo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        octo.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => octo.tags.includes(tag));

      const matchesFormat = !selectedFormat || 
        octo.format === selectedFormat;

      const matchesAccess = !selectedAccess || 
        octo.access === selectedAccess;

      return matchesSearch && matchesTags && matchesFormat && matchesAccess;
    });
  }, [octos, searchTerm, selectedTags, selectedFormat, selectedAccess]);

  useEffect(() => {
    if (typeof controlledVisibleCount === 'number') return; // Contrôle externe
    if (internalVisibleCount < 100) {
      const timeout = setTimeout(() => {
        setInternalVisibleCount((c) => c + 1);
      }, ANIMATION_DELAY);
      return () => clearTimeout(timeout);
    } else if (internalVisibleCount === 100) {
      setInternalVisibleCount(HEX_COUNT);
    }
  }, [internalVisibleCount, controlledVisibleCount]);

  useEffect(() => {
    const positions = spiralPositions.current.slice(0, visibleCount);
    const grid = new Grid(HexFactory, positions);
    
    const parentOctos = filteredOctos.filter(octo => 
      !octo.isNested || (octo.isNested && octo.position === 0)
    );

    const hexes = Array.from(grid).map((hex, index) => ({
      hex,
      octo: parentOctos[index] || undefined,
    }));
    
    setHexPositions(hexes);
  }, [visibleCount, filteredOctos]);

  const svgWidth = VIEWPORT_WIDTH * 2;
  const svgHeight = VIEWPORT_HEIGHT * 2;

  // État pour le zoom et le pan
  const [scale, setScale] = useState(0.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredHex, setHoveredHex] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Récupérer les octos avec position pour la navigation clavier
  const octosWithPosition = useMemo(() => {
    return hexPositions
      .map((pos, index) => ({ ...pos, index }))
      .filter(pos => pos.octo);
  }, [hexPositions]);

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'keyboard') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          e.preventDefault();
          navigateToNearestOcto(e.key);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedOctoIndex !== null && octosWithPosition[selectedOctoIndex]) {
            const selectedOcto = octosWithPosition[selectedOctoIndex].octo;
            if (selectedOcto) {
              openDetailModal(selectedOcto);
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          setViewMode('free');
          setSelectedOctoIndex(null);
          break;
      }
    };

    if (viewMode === 'keyboard') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [viewMode, selectedOctoIndex, octosWithPosition]);

  // Fonction pour naviguer vers l'octo le plus proche
  const navigateToNearestOcto = (direction: string) => {
    if (octosWithPosition.length === 0) return;

    const currentIndex = selectedOctoIndex;
    
    // Si aucun octo sélectionné, commencer par le centre (index 0)
    if (currentIndex === null) {
      setSelectedOctoIndex(0);
      centerOnOcto(0);
      return;
    }

    const currentPos = octosWithPosition[currentIndex];
    if (!currentPos) return;

    let bestIndex = currentIndex;
    let bestDistance = Infinity;

    // Calculer la direction souhaitée
    const directionVector = {
      'ArrowUp': { x: 0, y: -1 },
      'ArrowDown': { x: 0, y: 1 },
      'ArrowLeft': { x: -1, y: 0 },
      'ArrowRight': { x: 1, y: 0 }
    }[direction] || { x: 0, y: 0 };

    // Trouver l'octo le plus proche dans la direction donnée
    octosWithPosition.forEach((pos, index) => {
      if (index === currentIndex) return;

      const deltaX = pos.hex.x - currentPos.hex.x;
      const deltaY = pos.hex.y - currentPos.hex.y;
      
      // Vérifier si l'octo est dans la bonne direction
      const dotProduct = deltaX * directionVector.x + deltaY * directionVector.y;
      if (dotProduct <= 0) return; // Pas dans la bonne direction

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    if (bestIndex !== currentIndex) {
      setSelectedOctoIndex(bestIndex);
      centerOnOcto(bestIndex);
    }
  };

  // Centrer la vue sur un octo spécifique
  const centerOnOcto = (index: number) => {
    const octoPos = octosWithPosition[index];
    if (!octoPos) return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    // Calculer la position pour centrer l'hexagone sélectionné
    // Les hexagones sont positionnés relativement au centre du SVG (0,0)
    // On veut que l'hexagone sélectionné soit au centre de l'écran
    setPosition({
      x: -(octoPos.hex.x * scale),
      y: -(octoPos.hex.y * scale)
    });
  };

  // Fonctions de zoom et pan
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleResetView = () => {
    setScale(0.5);
    setPosition({ x: 0, y: 0 });
    setViewMode('free');
    setSelectedOctoIndex(null);
  };

  const handleSetViewMode = (mode: 'free' | 'centered' | 'keyboard') => {
    setViewMode(mode);
    setSelectedOctoIndex(null);
    
    if (mode === 'centered') {
      setPosition({ x: 0, y: 0 });
      setScale(0.7);
    } else if (mode === 'keyboard') {
      // Réinitialiser la position et le scale
      setPosition({ x: 0, y: 0 });
      setScale(0.8);
      // Sélectionner le premier octo disponible
      if (octosWithPosition.length > 0) {
        setSelectedOctoIndex(0);
        // Centrer sur le premier octo (qui est au centre de la spirale)
        setTimeout(() => {
          centerOnOcto(0);
        }, 50);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== 'free') return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || viewMode !== 'free') return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(2, prev * delta)));
  };

  const getDataAttributes = (octo?: Octo) => {
    if (!octo) return {};
    return {
      'data-octo-id': octo.id,
      'data-octo-title': octo.title,
      'data-octo-format': octo.format,
      'data-octo-access': octo.access,
      'data-octo-tags': octo.tags.join(','),
      'data-octo-added': octo.addedAt
    };
  };

  const getCursorStyle = () => {
    return 'default';
  };

  useImperativeHandle(ref, () => ({
    handleZoomIn,
    handleZoomOut,
    handleResetView,
    handleSetViewMode,
  }));

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-gradient-to-br from-gray-50 via-white to-primary-50/30 overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: getCursorStyle() }}
      tabIndex={viewMode === 'keyboard' ? 0 : -1}
    >
      {/* Control Panel */}
      <div className="absolute md:top-6 top-auto md:right-6 right-1/2 md:translate-x-0 translate-x-1/2 bottom-4 md:bottom-auto z-20 flex flex-col gap-3 pointer-events-none w-full md:w-auto">
        <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 pointer-events-auto">
          <button
            onClick={() => handleSetViewMode('free')}
            className={`p-3 md:p-2 rounded-md transition-all duration-200 ${
              viewMode === 'free' 
                ? 'bg-primary-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="Free mode"
            title="Free mode"
          >
            <Move className="h-5 w-5 md:h-4 md:w-4" />
          </button>
          
          <button
            onClick={() => handleSetViewMode('centered')}
            className={`p-3 md:p-2 rounded-md transition-all duration-200 ${
              viewMode === 'centered' 
                ? 'bg-primary-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="Centered mode"
            title="Centered mode"
          >
            <Target className="h-5 w-5 md:h-4 md:w-4" />
          </button>
          
          <button
            onClick={() => handleSetViewMode('keyboard')}
            className={`p-3 md:p-2 rounded-md transition-all duration-200 ${
              viewMode === 'keyboard' 
                ? 'bg-primary-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="Keyboard mode"
            title="Keyboard mode"
          >
            <Keyboard className="h-5 w-5 md:h-4 md:w-4" />
          </button>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-1 pointer-events-auto">
          <button
            onClick={handleZoomIn}
            className="p-3 md:p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-5 w-5 md:h-4 md:w-4 text-gray-700" />
          </button>
          
          <button
            onClick={handleZoomOut}
            className="p-3 md:p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-5 w-5 md:h-4 md:w-4 text-gray-700" />
          </button>
          
          <button
            onClick={handleResetView}
            className="p-3 md:p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700"
            aria-label="Reset view"
          >
            <RotateCcw className="h-5 w-5 md:h-4 md:w-4 text-gray-700" />
          </button>
        </div>
      </div>
      {/* Keyboard Mode Instructions */}
      {viewMode === 'keyboard' && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 bg-white/95 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="text-center">
            <h3 className="font-semibold text-gray-800 mb-2">Keyboard Navigation Mode</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>🔄 Arrows: Navigate</span>
              <span>⏎ Enter: Open</span>
              <span>⎋ Escape: Exit</span>
            </div>
          </div>
        </div>
      )}

      {/* SVG Container */}
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center',
          transition: isDragging ? 'none' : viewMode === 'keyboard' ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'transform 0.3s ease-out'
        }}
      >
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`-${svgWidth/2} -${svgHeight/2} ${svgWidth} ${svgHeight}`}
          className="honeycomb-grid"
          style={{ 
            overflow: 'visible'
          }}
          data-grid-type="spiral"
          data-hex-count={HEX_COUNT}
        >
          {hexPositions.map(({ hex, octo }, index) => {
            const isSelected = viewMode === 'keyboard' && 
              selectedOctoIndex !== null && 
              octosWithPosition[selectedOctoIndex]?.index === index;
              
            if (octo?.isNested) {
              const nestedGroup = hiveOctos.filter(o => o.nestedGroupId === octo.nestedGroupId);
              return (
                <NestedHexagon
                  key={`hex-${index}`}
                  hex={hex}
                  octos={nestedGroup}
                  onClick={() => octo && openDetailModal(octo)}
                  onMouseEnter={() => setHoveredHex('filled')}
                  onMouseLeave={() => setHoveredHex(null)}
                 isSelected={isSelected}
                />
              );
            }
            return (
              <SpiralHexagon
                key={`hex-${index}`}
                hex={hex}
                octo={octo}
                onClick={() => octo && openDetailModal(octo)}
                onMouseEnter={() => setHoveredHex(octo ? 'filled' : 'empty')}
                onMouseLeave={() => setHoveredHex(null)}
               isSelected={isSelected}
                {...getDataAttributes(octo)}
              />
            );
          })}
        </svg>
      </div>

      {showNestedForm && <NestedOctoForm onClose={() => setShowNestedForm(false)} />}
    </div>
  );
});

export const SpiralHexGrid2D = SpiralHexGrid;

// Panneau de contrôle persistant
interface ControlPanelProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onSetViewMode: (mode: 'free' | 'centered' | 'keyboard') => void;
  viewMode: 'free' | 'centered' | 'keyboard';
  onToggle3D: () => void;
  is3D: boolean;
  disableKeyboard: boolean;
}

const ControlPanel = memo(({
  onZoomIn,
  onZoomOut,
  onReset,
  onSetViewMode,
  viewMode,
  onToggle3D,
  is3D,
  disableKeyboard
}: ControlPanelProps) => (
  <div className="absolute md:top-6 top-auto md:right-6 right-1/2 md:translate-x-0 translate-x-1/2 bottom-4 md:bottom-auto z-20 flex flex-col gap-3 pointer-events-none w-full md:w-auto">
    <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1 pointer-events-auto">
      <button
        onClick={() => onSetViewMode('free')}
        className={`p-3 md:p-2 rounded-md transition-all duration-200 ${viewMode === 'free' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
        aria-label="Free mode"
        title="Free mode"
      >
        <Move className="h-5 w-5 md:h-4 md:w-4" />
      </button>
      <button
        onClick={() => onSetViewMode('centered')}
        className={`p-3 md:p-2 rounded-md transition-all duration-200 ${viewMode === 'centered' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
        aria-label="Centered mode"
        title="Centered mode"
      >
        <Target className="h-5 w-5 md:h-4 md:w-4" />
      </button>
      <button
        onClick={() => !disableKeyboard && onSetViewMode('keyboard')}
        className={`p-3 md:p-2 rounded-md transition-all duration-200 ${viewMode === 'keyboard' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'} ${disableKeyboard ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label="Keyboard mode"
        title="Keyboard mode"
        disabled={disableKeyboard}
      >
        <Keyboard className="h-5 w-5 md:h-4 md:w-4" />
      </button>
      <button
        onClick={onToggle3D}
        className={`p-3 md:p-2 rounded-md transition-all duration-200 ${is3D ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
        title={is3D ? 'Revenir en mode grille 2D' : 'Passer en mode sphère 3D'}
      >
        <Globe className="h-5 w-5 md:h-4 md:w-4" />
      </button>
    </div>
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-1 pointer-events-auto">
      <button
        onClick={onZoomIn}
        className="p-3 md:p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700"
        aria-label="Zoom in"
      >
        <ZoomIn className="h-5 w-5 md:h-4 md:w-4 text-gray-700" />
      </button>
      
      <button
        onClick={onZoomOut}
        className="p-3 md:p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700"
        aria-label="Zoom out"
      >
        <ZoomOut className="h-5 w-5 md:h-4 md:w-4 text-gray-700" />
      </button>
      
      <button
        onClick={onReset}
        className="p-3 md:p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700"
        aria-label="Reset view"
      >
        <RotateCcw className="h-5 w-5 md:h-4 md:w-4 text-gray-700" />
      </button>
    </div>
  </div>
));

const SpiralHexGrid3DWrapper: React.FC<SpiralHexGridProps> = (props) => {
  const [mode, setMode] = useState<'2d' | 'transitioning' | '3d'>('2d');
  const [reverseVisibleCount, setReverseVisibleCount] = useState(100);
  const [forwardVisibleCount, setForwardVisibleCount] = useState<number | null>(0);
  const [show3D, setShow3D] = useState(false);
  const [show2D, setShow2D] = useState(true);

  // États pour le contrôle 2D
  const [viewMode, setViewMode] = useState<'free' | 'centered' | 'keyboard'>('free');
  const spiralGridRef = useRef<any>(null);
  // États pour le contrôle 3D
  const hexSphereRef = useRef<any>(null);

  // Gestion de la transition 2D -> 3D
  useEffect(() => {
    if (mode === 'transitioning') {
      setShow3D(false);
      setShow2D(true);
      if (reverseVisibleCount > 0) {
        const timeout = setTimeout(() => {
          setReverseVisibleCount((c) => c - 1);
        }, 3);
        return () => clearTimeout(timeout);
      } else {
        setTimeout(() => {
          setShow3D(true);
          setShow2D(false);
          setMode('3d');
        }, 200);
      }
    }
  }, [mode, reverseVisibleCount]);

  // Gestion de la transition 3D -> 2D
  useEffect(() => {
    if (mode === '3d' && !show3D) {
      // Quand show3D passe à false, on lance l'animation d'apparition progressive
      setForwardVisibleCount(0);
      setShow2D(true);
      let count = 0;
      const animate = () => {
        if (count < 100) {
          setForwardVisibleCount(count);
          count++;
          setTimeout(animate, 3);
        } else {
          setForwardVisibleCount(null);
          setMode('2d');
        }
      };
      animate();
    }
  }, [mode, show3D]);

  // Handler du bouton
  const handleToggleMode = () => {
    if (mode === '2d') {
      setMode('transitioning');
      setReverseVisibleCount(100);
    } else if (mode === '3d') {
      setShow3D(false); // Lance le fondu/scale out
      setTimeout(() => {
        setShow2D(true);
      }, 200);
    }
  };

  // Handlers pour le panneau de contrôle
  // 2D
  const handleZoomIn2D = () => spiralGridRef.current?.handleZoomIn?.();
  const handleZoomOut2D = () => spiralGridRef.current?.handleZoomOut?.();
  const handleReset2D = () => spiralGridRef.current?.handleResetView?.();
  const handleSetViewMode2D = (mode: 'free' | 'centered' | 'keyboard') => {
    setViewMode(mode);
    spiralGridRef.current?.handleSetViewMode?.(mode);
  };
  // 3D
  const handleZoomIn3D = () => hexSphereRef.current?.zoomIn?.();
  const handleZoomOut3D = () => hexSphereRef.current?.zoomOut?.();
  const handleReset3D = () => hexSphereRef.current?.resetView?.();
  // Panneau de contrôle : dispatch selon le mode
  const is3D = mode === '3d';
  const handleZoomIn = is3D ? handleZoomIn3D : handleZoomIn2D;
  const handleZoomOut = is3D ? handleZoomOut3D : handleZoomOut2D;
  const handleReset = is3D ? handleReset3D : handleReset2D;
  const handleSetViewMode = is3D ? () => {} : handleSetViewMode2D;
  const disableKeyboard = is3D;

  return (
    <div className="relative w-full h-full">
      <ControlPanel
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onSetViewMode={handleSetViewMode}
        viewMode={viewMode}
        onToggle3D={handleToggleMode}
        is3D={is3D}
        disableKeyboard={disableKeyboard}
      />
      {/* Affichage du mode avec animation */}
      <AnimatePresence>
        {show2D && (mode === '2d' || mode === 'transitioning' || (mode === '3d' && !show3D)) && (
          <motion.div
            key="2d"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 1 }}
          >
            <SpiralHexGrid
              ref={spiralGridRef}
              {...props}
              controlledVisibleCount={
                mode === 'transitioning' ? reverseVisibleCount :
                (mode === '3d' && !show3D && forwardVisibleCount !== null ? forwardVisibleCount : undefined)
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {show3D && mode === '3d' && (
          <motion.div
            key="3d"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 2 }}
          >
            <HexSphere3D ref={hexSphereRef} octos={props.octos} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpiralHexGrid3DWrapper;