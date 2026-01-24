import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ArchivistPanel from './components/archivist/ArchivistPanel';
import { useHive } from './context/HiveContext';
import { useSearch } from './context/SearchContext';
import { useModal } from './context/ModalContext';
import { useGun } from './context/GunContext';
import { useProject } from './context/ProjectContext';
import { useFirebase } from './context/FirebaseContext';
import OctoDetailModal from './components/modals/OctoDetailModal';
import Modal from './components/modals/Modal';
import MyOctosPage from './pages/MyOctosPage';
import DataRequestsBoardPage from './pages/DataRequestsBoardPage';
import SettingsPage from './pages/SettingsPage';
import FileViewer from './components/ui/FileViewer';
import AddNodePanel from './components/ui/AddNodePanel';
import Map from './hexmap/components/Map';
import type { Alert } from './hexmap/types';
import type { HiveNode, NodeType } from './types';

function AppContent() {
  const [archivistOpen, setArchivistOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'my-octos' | 'data-requests-board' | 'settings'>('home');
  const { octos, viewMode, setViewMode, setTargetUserId } = useHive();
  const { selectedTags, selectedFormat, selectedAccess, searchTerm } = useSearch();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { openDetailModal } = useModal();
  const { gun } = useGun();
  const { projectNodes, activeProject, addNode, updateNode } = useProject();
  const [showOctos, setShowOctos] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedNode, setSelectedNode] = useState<HiveNode | null>(null);
  const [showAddNodePanel, setShowAddNodePanel] = useState(false);
  const [addNodePosition, setAddNodePosition] = useState<{ u: number; v: number } | undefined>();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const addAlert = (alert: Alert) => {
    setAlerts((prev) => [...prev, alert]);
    setTimeout(() => {
      setAlerts((prev) => prev.slice(1));
    }, 3000);
  };
  const dataLink = null;

  // Centralisation du filtrage
  const filteredOctos = octos.filter(octo => {
    if (selectedTags.length && !selectedTags.some(tag => octo.tags?.includes(tag))) return false;
    if (selectedFormat && octo.format !== selectedFormat) return false;
    if (selectedAccess && octo.access !== selectedAccess) return false;
    if (searchTerm && !octo.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Handler pour afficher les octos après clic sur le soleil
  const handleShowOctos = () => setShowOctos(true);

  // Handler pour clic sur un utilisateur
  const handleUserClick = (userId: string) => {
    setTargetUserId(userId);
    setViewMode('personal');
    addAlert({ type: 'info', text: `Affichage des octos de l'utilisateur ${userId}` });
  };

  // Handler pour clic sur la grille (ajouter un node en mode projects)
  const handleGridClick = (u: number, v: number) => {
    if (viewMode === 'projects' && activeProject) {
      setAddNodePosition({ u, v });
      setShowAddNodePanel(true);
    }
  };

  // Handler pour ajouter un nouveau node
  const handleAddNode = async (type: NodeType, title: string, content?: string) => {
    if (!activeProject || !addNodePosition) return;

    await addNode({
      projectId: activeProject.id,
      type,
      q: addNodePosition.u,
      r: addNodePosition.v,
      title,
      content: type === 'note' ? { text: content } : type === 'link' ? { url: content } : { fileUrl: content },
    });

    addAlert({ type: 'success', text: `Node "${title}" created!` });
  };

  // Handler pour déplacer un node (drag & drop)
  const handleNodeDrop = async (nodeId: string, newU: number, newV: number) => {
    await updateNode(nodeId, { q: newU, r: newV });
    addAlert({ type: 'info', text: `Node moved to (${newU}, ${newV})` });
  };

  // Handler pour déplacer un octo dans My Hive (drag & drop)
  const { updateOcto } = useFirebase();
  const handleOctoDrop = async (octoId: string, newU: number, newV: number) => {
    await updateOcto(octoId, { gridU: newU, gridV: newV });
    addAlert({ type: 'info', text: `Octo moved to (${newU}, ${newV})` });
  };

  // Handler pour réinitialiser les positions des octos en spirale par date
  const handleResetPositions = async () => {
    if (!octos || octos.length === 0) {
      addAlert({ type: 'warning', text: 'No octos to reset' });
      return;
    }

    // Sort by createdAt (oldest first)
    const sortedOctos = [...octos].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });

    // Compute spiral positions
    const spiralPositions = computeSpiralPositions(sortedOctos.length);

    // Update all octos with new positions
    addAlert({ type: 'info', text: `Resetting ${sortedOctos.length} octo positions...` });

    for (let i = 0; i < sortedOctos.length; i++) {
      const octo = sortedOctos[i];
      const pos = spiralPositions[i];
      await updateOcto(octo.id, { gridU: pos.u, gridV: pos.v });
    }

    addAlert({ type: 'success', text: 'All positions reset to spiral order!' });
    // Reload will happen automatically when Firebase updates
  };

  // Helper: compute spiral positions - EXACT copy from Map.tsx
  const computeSpiralPositions = (count: number): { u: number; v: number }[] => {
    const positions: { u: number; v: number }[] = [];
    if (count === 0) return positions;
    let placed = 0;
    let layer = 1;
    const directions = [
      [0, 1],    // N
      [-1, 1],   // NW
      [-1, 0],   // W
      [0, -1],   // S
      [1, -1],   // SE
      [1, 0]     // E
    ];
    while (placed < count) {
      let u = layer, v = 0;
      // First direction (N): 1 step only
      if (placed < count) {
        positions.push({ u, v });
        placed++;
      }
      // 5 following directions: layer steps
      for (let dir = 1; dir < 6 && placed < count; dir++) {
        for (let step = 0; step < layer && placed < count; step++) {
          u += directions[dir][0];
          v += directions[dir][1];
          positions.push({ u, v });
          placed++;
        }
      }
      // Last direction (E): layer-1 steps to close the ring
      if (placed < count) {
        for (let step = 1; step < layer && placed < count; step++) {
          u += directions[0][0];
          v += directions[0][1];
          positions.push({ u, v });
          placed++;
        }
      }
      layer++;
    }
    return positions;
  };

  if (currentPage === 'my-octos') {
    return <MyOctosPage onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'data-requests-board') {
    return <DataRequestsBoardPage onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'settings') {
    return <SettingsPage onBack={() => setCurrentPage('home')} />;
  }

  return (
    <>
      {/* Affichage des alertes */}
      {!isMobile ? (
        <div style={{ position: 'fixed', top: 20, left: 0, right: 0, zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
          {alerts.map((alert, i) => (
            <div key={i} className={`custom-alert custom-alert-${alert.type}`} style={{ pointerEvents: 'auto', marginBottom: 8 }}>
              {alert.text}
            </div>
          ))}
        </div>
      ) : (
        alerts.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 999,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            overflowX: 'auto',
            gap: 8,
            padding: '8px 4px',
            background: 'rgba(255,255,255,0.95)',
            pointerEvents: 'none',
            maxHeight: 70
          }}>
            {alerts.slice(-2).map((alert, i) => (
              <div
                key={i}
                className={`custom-alert custom-alert-${alert.type}`}
                style={{
                  minWidth: 180,
                  maxWidth: 260,
                  margin: 0,
                  fontSize: '0.95em',
                  pointerEvents: 'auto',
                  whiteSpace: 'pre-line',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: '0 0 auto',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
                }}
              >
                {alert.text}
              </div>
            ))}
          </div>
        )
      )}
      <motion.div
        className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-200/30 to-secondary-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-accent-200/20 to-primary-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-100/10 to-secondary-100/10 rounded-full blur-3xl"></div>
        </div>

        <Header
          onArchivistToggle={() => setArchivistOpen(!archivistOpen)}
          onMyOctos={() => setCurrentPage('my-octos')}
          onSettings={() => setCurrentPage('settings')}
        />

        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar />
          <main className="flex-1 relative overflow-hidden">
            <Map
              addAlert={addAlert}
              dataLink={dataLink}
              octos={viewMode === 'all-users' ? [] : (showOctos ? filteredOctos : [])}
              projectNodes={projectNodes}
              activeProject={activeProject}
              onOctoClick={openDetailModal}
              onNodeClick={(node) => setSelectedNode(node)}
              onGridClick={handleGridClick}
              onNodeDrop={handleNodeDrop}
              onOctoDrop={handleOctoDrop}
              onResetPositions={handleResetPositions}
              onShowOctos={handleShowOctos}
              showAllUsers={viewMode === 'all-users'}
              viewMode={viewMode}
              onUserClick={handleUserClick}
              gun={gun}
            />
            <ArchivistPanel isOpen={archivistOpen} onClose={() => setArchivistOpen(false)} />
          </main>
        </div>

        {/* Floating Data Requests Button - only on home page */}
        {/* {currentPage === 'home' && (
          <motion.button
            onClick={() => setCurrentPage('data-requests-board')}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full shadow-2xl flex items-center justify-center z-50 border-4 border-amber-300"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1, type: 'spring', stiffness: 300 }}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            title="Data Bounty Board"
            style={{
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4), 0 0 0 4px rgba(252, 211, 77, 0.3)'
            }}
          >
            <MiniBountyBoardIcon className="w-10 h-10" />
          </motion.button>
        )} */}

        <OctoDetailModal />
        <Modal />
      </motion.div>

      {/* FileViewer for HiveNode content */}
      <AnimatePresence>
        {selectedNode && (
          <FileViewer
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </AnimatePresence>

      {/* AddNodePanel for creating nodes in projects mode */}
      <AddNodePanel
        isOpen={showAddNodePanel}
        onClose={() => setShowAddNodePanel(false)}
        onAddNode={handleAddNode}
        position={addNodePosition}
      />
    </>
  );
}

export default AppContent; 