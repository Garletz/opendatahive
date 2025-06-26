import React, { useState, useEffect } from 'react';
import { Tag, Database, GitMerge, Filter, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../../context/SearchContext';
import { useHive } from '../../context/HiveContext';

interface SidebarProps {
  showSidebar?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ showSidebar = false }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const { 
    selectedTags, 
    toggleTag, 
    selectedFormat, 
    setSelectedFormat,
    selectedAccess,
    setSelectedAccess,
    clearFilters
  } = useSearch();
  const { trendingFilter, setTrendingFilter } = useHive();

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const popularTags = ['climate', 'health', 'transport', 'economy', 'energy', 'environment', 'education', 'finance', 'government', 'technology'];
  const formats = ['JSON', 'CSV', 'XML', 'API'];
  const accessTypes = ['REST', 'GraphQL', 'SOAP', 'SPARQL'];

  return (
    <motion.aside
      className={`bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 transition-all duration-300 shadow-xl z-10 relative
        ${collapsed ? 'w-16' : 'w-72'}
        hidden md:block
        ${showSidebar ? '!block fixed top-0 left-0 h-full w-64 z-40' : ''}
      `}
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      style={{
        boxShadow: '4px 0 20px rgba(0,0,0,0.1), inset -1px 0 0 rgba(255,255,255,0.5)'
      }}
      aria-label="Sidebar"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-secondary-50/20 pointer-events-none"></div>
      
      {/* Toggle button */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-5 -right-3 z-30 p-1.5 rounded-full bg-white hover:bg-gray-100 transition-all duration-300 shadow-lg border border-gray-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft size={18} className="text-primary-700" />
        </motion.div>
      </motion.button>

      <div className="h-full flex flex-col overflow-y-auto px-4 pt-4 scrollbar-hide">
        {/* Trending Filter */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-4 border border-gray-200"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {[
                { key: 'all', label: 'All' },
                { key: 'trending', label: '🔥' },
                { key: 'recent', label: '🆕' }
              ].map(({ key, label }) => (
                <motion.button
                  key={key}
                  onClick={() => setTrendingFilter(key as any)}
                  className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    trendingFilter === key
                      ? 'bg-white text-primary-600 shadow'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={key.charAt(0).toUpperCase() + key.slice(1)}
                >
                  {label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center mb-4">
            <motion.div
              className={`p-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg ${!collapsed ? 'mr-3' : ''}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Filter className="h-5 w-5 text-white" />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.h2 
                  className="font-heading font-bold text-lg text-gray-800"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  Filters
                </motion.h2>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-800 mb-4 px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 transition-all duration-200 border border-primary-200 shadow-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Reset filters
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tags Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center mb-4">
            <motion.div
              className={`p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg ${!collapsed ? 'mr-3' : ''}`}
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <Tag className="h-5 w-5 text-white" />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.h2 
                  className="font-heading font-bold text-lg text-gray-800"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  Popular Tags
                </motion.h2>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                className="flex flex-wrap gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {popularTags.map((tag, index) => (
                  <motion.button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-2 text-sm rounded-xl transition-all duration-300 font-medium shadow-sm border ${
                      selectedTags.includes(tag)
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-primary-400 shadow-lg'
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 border-gray-300'
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      boxShadow: selectedTags.includes(tag) 
                        ? '0 4px 12px rgba(255, 193, 7, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        : '0 2px 6px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    {tag}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Formats Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center mb-4">
            <motion.div
              className={`p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 shadow-lg ${!collapsed ? 'mr-3' : ''}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Database className="h-5 w-5 text-white" />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.h2 
                  className="font-heading font-bold text-lg text-gray-800"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  Formats
                </motion.h2>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {formats.map((format, index) => (
                  <motion.div 
                    key={format} 
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <motion.input
                      type="radio"
                      id={`format-${format}`}
                      name="format"
                      checked={selectedFormat === format}
                      onChange={() => setSelectedFormat(selectedFormat === format ? null : format)}
                      className="mr-3 accent-primary-500 w-4 h-4"
                      whileHover={{ scale: 1.1 }}
                    />
                    <motion.label 
                      htmlFor={`format-${format}`} 
                      className="text-sm text-gray-700 font-medium cursor-pointer hover:text-primary-600 transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      {format}
                    </motion.label>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Access Types Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center mb-4">
            <motion.div
              className={`p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg ${!collapsed ? 'mr-3' : ''}`}
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <GitMerge className="h-5 w-5 text-white" />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.h2 
                  className="font-heading font-bold text-lg text-gray-800"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  Access Types
                </motion.h2>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {accessTypes.map((access, index) => (
                  <motion.div 
                    key={access} 
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <motion.input
                      type="radio"
                      id={`access-${access}`}
                      name="access"
                      checked={selectedAccess === access}
                      onChange={() => setSelectedAccess(selectedAccess === access ? null : access)}
                      className="mr-3 accent-primary-500 w-4 h-4"
                      whileHover={{ scale: 1.1 }}
                    />
                    <motion.label 
                      htmlFor={`access-${access}`} 
                      className="text-sm text-gray-700 font-medium cursor-pointer hover:text-primary-600 transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      {access}
                    </motion.label>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;