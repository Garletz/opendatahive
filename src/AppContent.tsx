import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import ArchivistPanel from './components/archivist/ArchivistPanel';
import { useHive } from './context/HiveContext';
import { useSearch } from './context/SearchContext';
import { useModal } from './context/ModalContext';
import { useGun } from './context/GunContext';
import { useProject } from './context/ProjectContext';
import OctoDetailModal from './components/modals/OctoDetailModal';
import Modal from './components/modals/Modal';
import MyOctosPage from './pages/MyOctosPage';
import DataRequestsBoardPage from './pages/DataRequestsBoardPage';
import SettingsPage from './pages/SettingsPage';
// import MiniBountyBoardIcon from './components/icons/MiniBountyBoardIcon';
import Map from './hexmap/components/Map';
import type { Alert } from './hexmap/types';

function AppContent() {
  const [archivistOpen, setArchivistOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'my-octos' | 'data-requests-board' | 'settings'>('home');
  const { octos, viewMode, setViewMode, setTargetUserId } = useHive();
  const { selectedTags, selectedFormat, selectedAccess, searchTerm } = useSearch();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { openDetailModal } = useModal();
  const { gun } = useGun();
  const { projectNodes, activeProject } = useProject();
  const [showOctos, setShowOctos] = useState(false); // Ajout
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
    </>
  );
}

export default AppContent; 