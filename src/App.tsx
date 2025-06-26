import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import SpiralHexGrid from './components/grid/SpiralHexGrid';
import ArchivistPanel from './components/archivist/ArchivistPanel';
import { HiveProvider, useHive } from './context/HiveContext';
import { SearchProvider } from './context/SearchContext';
import { ModalProvider } from './context/ModalContext';
import { InteractionProvider } from './context/InteractionContext';
import { FirebaseProvider } from './context/FirebaseContext';
import { AuthProvider } from './context/AuthContext';
import OctoDetailModal from './components/modals/OctoDetailModal';
import Modal from './components/modals/Modal';
import MyOctosPage from './pages/MyOctosPage';
import DataRequestsBoardPage from './pages/DataRequestsBoardPage';
import SettingsPage from './pages/SettingsPage';
import MiniBountyBoardIcon from './components/icons/MiniBountyBoardIcon';

function AppContent() {
  const [archivistOpen, setArchivistOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'my-octos' | 'data-requests-board' | 'settings'>('home');
  const { octos } = useHive();

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
        onDataRequests={() => setCurrentPage('data-requests-board')}
        onSettings={() => setCurrentPage('settings')}
      />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 relative overflow-hidden">
          <SpiralHexGrid octos={octos} />
          <ArchivistPanel isOpen={archivistOpen} onClose={() => setArchivistOpen(false)} />
        </main>
      </div>
      
      {/* Floating Data Requests Button - only on home page */}
      {currentPage === 'home' && (
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
      )}
      
      <OctoDetailModal />
      <Modal />
    </motion.div>
  );
}

function App() {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <InteractionProvider>
          <HiveProvider>
            <SearchProvider>
              <ModalProvider>
                <AppContent />
              </ModalProvider>
            </SearchProvider>
          </HiveProvider>
        </InteractionProvider>
      </AuthProvider>
    </FirebaseProvider>
  );
}

export default App;