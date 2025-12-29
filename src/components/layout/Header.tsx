import React, { useState, useEffect } from 'react';
import { Search, Database, Menu, X, Info, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch, useHive, useModal, useAuth } from '@/context';
import AddOctoForm from '../grid/AddOctoForm';
import AuthButton from '../auth/AuthButton';
import HexSwitch from './HexSwitch';

interface HeaderProps {
  onArchivistToggle: () => void;
  onMyOctos?: () => void;
  onSettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMyOctos = () => { }, onSettings = () => { } }) => {
  const { searchTerm, setSearchTerm } = useSearch();
  const { trendingFilter, setTrendingFilter, viewMode, setViewMode, setTargetUserId } = useHive();
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

  const handleApiInfo = () => {
    openModal({
      title: "API Documentation",
      content: (
        <div className="p-4 space-y-6 text-slate-300">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-cyan-400">API Endpoints</h3>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <h4 className="font-medium text-slate-100 mb-2">List Octos</h4>
              <code className="block bg-slate-950 text-cyan-400 p-3 rounded-lg mb-2 font-mono text-sm border border-slate-800">GET /api/v1/octos</code>
              <p className="text-sm text-slate-400">Retrieve the list of all available octos</p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <h4 className="font-medium text-slate-100 mb-2">Octo Details</h4>
              <code className="block bg-slate-950 text-cyan-400 p-3 rounded-lg mb-2 font-mono text-sm border border-slate-800">GET /api/v1/octos/:id</code>
              <p className="text-sm text-slate-400">Retrieve details of a specific octo</p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <h4 className="font-medium text-slate-100 mb-2">Search by Tags</h4>
              <code className="block bg-slate-950 text-cyan-400 p-3 rounded-lg mb-2 font-mono text-sm border border-slate-800">GET /api/v1/octos?tags=tag1,tag2</code>
              <p className="text-sm text-slate-400">Filter octos by tags</p>
            </div>
          </div>
        </div>
      )
    });
  };

  const handleMobileMenuToggle = () => setShowMobileMenu((v) => !v);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-40 bg-black/30 backdrop-blur-md border-b border-white/5 shadow-2xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Section */}
            <div className="flex items-center gap-3 min-w-fit">
              <div className="hidden lg:block">
                <h1 className="text-white font-bold text-xl tracking-tight">
                  OpenData<span className="text-white">Hive</span>
                </h1>
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Data Intelligence</p>
              </div>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full group">
                <input
                  type="text"
                  placeholder="Search intelligence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 text-slate-200 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 focus:bg-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all font-medium placeholder:text-slate-500"
                />
                <Search className="absolute left-3.5 top-3 text-slate-500 w-5 h-5 group-focus-within:text-white transition-colors" />
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={handleApiInfo}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium text-sm border border-transparent hover:border-white/10"
              >
                <Info className="w-4 h-4" />
                <span>API</span>
              </button>

              {user && (
                <>
                  <motion.button
                    onClick={handleAddOcto}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg font-semibold text-sm shadow-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Source</span>
                  </motion.button>

                  <div className="h-8 w-px bg-white/10 mx-1"></div>

                  <HexSwitch
                    value={viewMode}
                    onChange={(mode) => {
                      if (mode === 'personal') setTargetUserId(null);
                      setViewMode(mode);
                    }}
                    allowReselect={true}
                  />
                </>
              )}

              <AuthButton onMyOctos={onMyOctos} onSettings={onSettings} />
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-slate-400 hover:text-slate-200"
              >
                <Search className="w-6 h-6" />
              </button>
              <button
                onClick={handleMobileMenuToggle}
                className="p-2 text-slate-400 hover:text-slate-200"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <AnimatePresence>
            {isMobile && isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3 md:hidden"
              >
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-700 focus:border-cyan-500 focus:outline-none"
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobile && showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleMobileMenuToggle}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-slate-800 z-50 p-6 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8 bg-slate-800/50 p-4 rounded-xl">
                <span className="text-slate-100 font-bold text-lg">Menu</span>
                <button
                  onClick={handleMobileMenuToggle}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Filters</h3>
                  {[
                    { key: 'all', label: 'All Sources' },
                    { key: 'trending', label: 'Trending' },
                    { key: 'recent', label: 'Recently Added' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => {
                        setTrendingFilter(key as any);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${trendingFilter === key
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Actions</h3>
                  <button onClick={handleApiInfo} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                    <Info className="w-5 h-5 text-cyan-400" />
                    <span>API Documentation</span>
                  </button>
                  {user && (
                    <button onClick={handleAddOcto} className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                      <Plus className="w-5 h-5 text-green-400" />
                      <span>Add Data Source</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-800">
                <AuthButton />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
};

export default Header;