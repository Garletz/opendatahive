import React, { useState, useEffect } from 'react';
import { Search, Hexagon as HexagonalPrism, BrainCircuit, X, Plus, Info, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearch } from '../../context/SearchContext';
import { useHive } from '../../context/HiveContext';
import { useModal } from '../../context/ModalContext';
import { useAuth } from '../../context/AuthContext';
import AddOctoForm from '../grid/AddOctoForm';
import NestedOctoForm from '../grid/NestedOctoForm';
import AuthButton from '../auth/AuthButton';

interface HeaderProps {
  onArchivistToggle: () => void;
  onMyOctos?: () => void;
  onSettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onArchivistToggle, onMyOctos = () => {}, onSettings = () => {} }) => {
  const { searchTerm, setSearchTerm } = useSearch();
  const { trendingFilter, setTrendingFilter } = useHive();
  const { openModal } = useModal();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAddOcto = () => {
    if (!user) {
      alert('You must be logged in to add an octo');
      return;
    }
    openModal({
      title: "Add Data Source",
      content: <AddOctoForm onClose={() => openModal(null)} />
    });
  };

  const handleAddGroup = () => {
    if (!user) {
      alert('You must be logged in to add an octo group');
      return;
    }
    openModal({
      title: "Add Octo Group",
      content: <NestedOctoForm onClose={() => openModal(null)} />
    });
  };
  const handleApiInfo = () => {
    openModal({
      title: "API Documentation",
      content: (
        <div className="p-4 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary-600">API Endpoints</h3>
            
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-2">List Octos</h4>
              <code className="block bg-gradient-to-r from-gray-800 to-gray-900 text-green-400 p-3 rounded-lg mb-2 font-mono text-sm shadow-inner">GET /api/v1/octos</code>
              <p className="text-sm text-gray-600">Retrieve the list of all available octos</p>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-2">Octo Details</h4>
              <code className="block bg-gradient-to-r from-gray-800 to-gray-900 text-green-400 p-3 rounded-lg mb-2 font-mono text-sm shadow-inner">GET /api/v1/octos/:id</code>
              <p className="text-sm text-gray-600">Retrieve details of a specific octo</p>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-2">Search by Tags</h4>
              <code className="block bg-gradient-to-r from-gray-800 to-gray-900 text-green-400 p-3 rounded-lg mb-2 font-mono text-sm shadow-inner">GET /api/v1/octos?tags=tag1,tag2</code>
              <p className="text-sm text-gray-600">Filter octos by tags</p>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="font-medium text-gray-900 mb-2">Response Format</h4>
              <p className="text-sm text-gray-600 mb-2">Responses are in JSON format with the following structure:</p>
              <pre className="bg-gradient-to-r from-gray-800 to-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto font-mono shadow-inner">
{`{
  "metadata": {
    "version": "1.0",
    "timestamp": "2024-03-21T12:00:00Z",
    "totalCount": 100
  },
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "tags": ["string"],
      "link": "string",
      "access": "string",
      "format": "string",
      "addedAt": "string"
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>
      )
    });
  };

  const handleMobileMenuToggle = () => setShowMobileMenu((v) => !v);

  return (
    <motion.header 
      className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 shadow-xl z-10 relative"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        boxShadow: '0 10px 25px rgba(255, 193, 7, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      }}
    >
      {/* Decorative overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
      
      <div className="container mx-auto px-2 md:px-4 py-2 md:py-4 relative">
        {/* Desktop header */}
        <div className="hidden md:flex items-center justify-between gap-2">
          {/* Logo and Title */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <HexagonalPrism className="text-white h-10 w-10 drop-shadow-lg" />
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
            </motion.div>
            <div className="hidden lg:block">
              <h1 className="text-white font-heading font-bold text-2xl md:text-3xl drop-shadow-lg">
                OpenDataHive
              </h1>
              <p className="text-primary-100 text-sm font-medium">Structured open data platform</p>
            </div>
          </motion.div>

          {/* Search Bar & Filters (Desktop) */}
          <motion.div
            className="flex-1 max-w-2xl mx-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative group flex-1">
                <input
                  type="text"
                  placeholder="Search open data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-3 pl-12 pr-4 rounded-2xl border-2 border-primary-300/50 focus:outline-none focus:border-white focus:ring-4 focus:ring-white/20 bg-white/95 backdrop-blur-sm shadow-lg transition-all duration-300 group-hover:shadow-xl"
                  style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), 0 4px 12px rgba(255,193,7,0.2)'
                  }}
                  aria-label="Search open data"
                />
                <Search className="absolute left-4 top-3.5 text-primary-500 h-5 w-5 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons (Desktop) */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={handleApiInfo}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              title="Documentation API"
              style={{
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              <Info className="h-5 w-5" />
                <span className="hidden lg:inline font-medium">API</span>
            </motion.button>
            {user && (
              <>
                <motion.button
                  onClick={handleAddOcto}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Plus className="h-5 w-5" />
                  <span className="hidden lg:inline font-medium">Ajouter</span>
                </motion.button>
                <motion.button
                  onClick={handleAddGroup}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Plus className="h-5 w-5" />
                  <span className="hidden lg:inline font-medium">Groupe</span>
                </motion.button>
              </>
            )}
            <motion.button
              onClick={onArchivistToggle}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                boxShadow: '0 4px 12px rgba(147, 51, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              <BrainCircuit className="h-5 w-5" />
              <span className="hidden lg:inline font-medium">AI Archivist</span>
            </motion.button>
            <AuthButton onMyOctos={onMyOctos} onSettings={onSettings} />
          </motion.div>
        </div>
        {/* Mobile header */}
        <div className="flex md:hidden items-center justify-between w-full relative min-h-[48px]">
          {/* Burger menu à gauche */}
          <div className="flex-1 flex items-center">
            <button onClick={handleMobileMenuToggle} className="p-2 rounded-md bg-white/20 hover:bg-white/40 text-white" aria-label="Ouvrir le menu">
              <Menu className="h-7 w-7" />
            </button>
          </div>
          {/* Logo + titre centré, position absolue pour rester centré */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center space-x-2 pointer-events-none select-none">
            <HexagonalPrism className="text-white h-8 w-8 drop-shadow-lg" />
            <span className="text-white font-heading font-bold text-xl drop-shadow-lg">OpenDataHive</span>
          </div>
          {/* AuthButton à droite */}
          <div className="flex-1 flex items-center justify-end">
            <AuthButton />
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isMobile && isSearchOpen && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 z-20 p-3 flex items-center"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
          >
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-2 text-white hover:bg-primary-700 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex-1 ml-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border-2 border-primary-300 focus:outline-none focus:border-white bg-white/95 backdrop-blur-sm"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile menu (slide-over) */}
      {isMobile && showMobileMenu && (
        <div className="fixed inset-0 z-40 bg-black/40 flex">
          <div className="w-64 bg-white shadow-xl h-full p-6 flex flex-col gap-6">
            <button onClick={handleMobileMenuToggle} className="self-end mb-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200" aria-label="Fermer le menu">
              <X className="h-6 w-6 text-gray-700" />
            </button>
            {/* Recherche */}
            <div className="mb-2">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:outline-none focus:border-primary-400"
                aria-label="Rechercher dans les données"
              />
            </div>
            {/* Filtres Trending */}
            <div className="flex gap-2 mb-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'trending', label: '🔥 Trending' },
                { key: 'recent', label: '🆕 Recent' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTrendingFilter(key as any)}
                  className={`flex-1 px-2 py-1 rounded-lg text-sm font-medium transition-all ${
                    trendingFilter === key
                      ? 'bg-primary-600 text-white shadow'
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  }`}
                  aria-label={label}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* Actions principales */}
            <div className="flex flex-col gap-3">
              <button onClick={onArchivistToggle} className="text-primary-700 font-semibold text-lg py-2 rounded-lg hover:bg-primary-50 flex items-center gap-2" aria-label="Archivist">
                <BrainCircuit className="inline-block mr-2" /> Archivist
              </button>
              <button onClick={handleApiInfo} className="text-blue-700 font-semibold text-lg py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2" aria-label="API">
                <Info className="inline-block mr-2" /> API
              </button>
              {user && (
                <button onClick={handleAddOcto} className="text-green-700 font-semibold text-lg py-2 rounded-lg hover:bg-green-50 flex items-center gap-2" aria-label="Add Data Source">
                  <Plus className="inline-block mr-2" /> Add Data Source
                </button>
              )}
            </div>
            <div className="mt-auto">
              <AuthButton />
            </div>
          </div>
          <div className="flex-1" onClick={handleMobileMenuToggle} />
        </div>
      )}
    </motion.header>
  );
};

export default Header;