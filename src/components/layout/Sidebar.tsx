import React, { useState, useEffect } from 'react';
import { Tag, Database, FolderGit2, Plus, ChevronLeft, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '@/context';
import { useProject } from '@/context/ProjectContext';

interface SidebarProps {
  showSidebar?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ showSidebar = false }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const { projects, activeProject, setActiveProject, createProject } = useProject();

  // Keep existing search context if needed for "inside project" filtering later
  const {
    selectedTags,
    toggleTag,
  } = useSearch();

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCreateProject = () => {
    const name = prompt("Project Name:");
    if (name) {
      createProject(name, "New Project");
    }
  };

  return (
    <motion.aside
      className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 shadow-xl z-30 relative
        ${collapsed ? 'w-16' : 'w-72'}
        hidden md:block
        ${showSidebar ? '!block fixed top-20 left-0 h-[calc(100vh-5rem)] w-64 z-40' : ''}
      `}
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      aria-label="Sidebar"
    >

      {/* Toggle button */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-5 -right-3 z-30 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-300 shadow-lg border border-slate-700"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft size={16} />
        </motion.div>
      </motion.button>

      <div className="h-full flex flex-col overflow-y-auto px-4 pt-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

        {/* PROJECTS HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <motion.div className={`p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 ${!collapsed ? 'mr-3' : ''}`}>
              <FolderGit2 size={18} />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.h2
                  className="font-bold text-sm text-slate-200 uppercase tracking-wider"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  My Projects
                </motion.h2>
              )}
            </AnimatePresence>
          </div>

          {!collapsed && (
            <motion.button
              onClick={handleCreateProject}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus size={16} />
            </motion.button>
          )}
        </div>

        {/* PROJECT LIST */}
        <div className="space-y-2 mb-8">
          {projects.map((project) => (
            <motion.button
              key={project.id}
              onClick={() => setActiveProject(project)}
              className={`w-full flex items-center p-2 rounded-lg transition-all duration-200 group border
                ${activeProject?.id === project.id
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                  : 'bg-transparent border-transparent hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <Hexagon size={18} className={activeProject?.id === project.id ? 'fill-indigo-500/20' : ''} />
              </div>

              {!collapsed && (
                <motion.span
                  className="ml-3 text-sm font-medium truncate"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {project.name}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>

        <div className="w-full h-px bg-slate-800 my-2" />

        {/* Existing Filters (Collapsed / Minimized for now) */}
        {!collapsed && (
          <div className="mt-4 opacity-50 hover:opacity-100 transition-opacity">
            <h3 className="text-xs uppercase text-slate-500 font-bold mb-3 tracking-wider">Global Filters</h3>
            <div className="flex flex-wrap gap-2">
              {['Environment', 'Tech', 'Finance'].map(tag => (
                <span key={tag} className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-400 border border-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </motion.aside>
  );
};

export default Sidebar;