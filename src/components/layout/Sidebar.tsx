import React, { useState, useEffect } from 'react';
import { FolderGit2, Plus, ChevronLeft, Hexagon, Trash2, Edit2, FileText, Link, Image, File, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch, useHive } from '@/context';
import { useProject } from '@/context/ProjectContext';

interface SidebarProps {
  showSidebar?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ showSidebar = false }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const { projects, activeProject, setActiveProject, createProject, projectNodes } = useProject();
  const { viewMode } = useHive();
  const [showProjectMenu, setShowProjectMenu] = useState<string | null>(null);

  // Search context available for future filtering
  useSearch();

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only show sidebar in projects mode
  if (viewMode !== 'projects') {
    return null;
  }

  const handleCreateProject = () => {
    const name = prompt("Project Name:");
    if (name) {
      createProject(name, "New Project");
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'note': return <FileText size={14} />;
      case 'link': return <Link size={14} />;
      case 'media': return <Image size={14} />;
      default: return <File size={14} />;
    }
  };

  return (
    <motion.aside
      className={`bg-black border-r border-white/10 transition-all duration-300 shadow-xl z-30 relative
        ${collapsed ? 'w-16' : 'w-80'}
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <motion.div
              className={`p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 ${!collapsed ? 'mr-3' : ''}`}
            >
              <FolderGit2 size={18} />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.h2
                  className="font-bold text-sm uppercase tracking-wider text-amber-300"
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
              className="p-1.5 rounded-md transition-colors hover:bg-amber-500/20 text-amber-400"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Create new project"
            >
              <Plus size={16} />
            </motion.button>
          )}
        </div>

        {/* PROJECT LIST */}
        <div className="space-y-2 mb-4">
          {projects.length === 0 ? (
            !collapsed && (
              <div className="text-center py-8 text-slate-500">
                <FolderGit2 size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No projects yet</p>
                <button
                  onClick={handleCreateProject}
                  className="mt-2 text-amber-400 hover:text-amber-300 text-sm"
                >
                  Create your first project
                </button>
              </div>
            )
          ) : (
            projects.map((project) => (
              <motion.div
                key={project.id}
                className="relative"
              >
                <motion.button
                  onClick={() => setActiveProject(project)}
                  className={`w-full flex items-center p-2 rounded-lg transition-all duration-200 group border
                    ${activeProject?.id === project.id
                      ? 'bg-amber-600/20 border-amber-500/50 text-amber-300'
                      : 'bg-transparent border-transparent hover:bg-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative">
                    <Hexagon size={18} className={activeProject?.id === project.id ? 'fill-amber-500/20' : ''} />
                  </div>

                  {!collapsed && (
                    <>
                      <motion.span
                        className="ml-3 text-sm font-medium truncate flex-1 text-left"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {project.name}
                      </motion.span>

                      {/* Project menu button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowProjectMenu(showProjectMenu === project.id ? null : project.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded transition-all"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </>
                  )}
                </motion.button>

                {/* Project dropdown menu */}
                <AnimatePresence>
                  {showProjectMenu === project.id && !collapsed && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
                    >
                      <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2">
                        <Edit2 size={14} /> Rename
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2">
                        <Trash2 size={14} /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>

        {/* PROJECT NODES - Only show with active project */}
        {activeProject && !collapsed && (
          <>
            <div className="w-full h-px bg-slate-800 my-4" />

            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs uppercase text-amber-400 font-bold tracking-wider">
                  {activeProject.name} Files
                </h3>
                <span className="text-xs text-slate-500">
                  {projectNodes.length} items
                </span>
              </div>

              {projectNodes.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  <p className="text-sm">No files in this project</p>
                  <p className="text-xs mt-1">Click on the grid to add files</p>
                </div>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {projectNodes.map((node) => (
                    <motion.button
                      key={node.id}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all text-left"
                      whileHover={{ x: 4 }}
                    >
                      <span className="text-amber-400">{getNodeIcon(node.type)}</span>
                      <span className="text-sm truncate flex-1">{node.title}</span>
                      <span className="text-xs text-slate-600 uppercase">{node.type}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}



        {/* Quick stats */}
        {!collapsed && (
          <div className="mt-auto pb-4">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="text-xs text-slate-500 uppercase mb-2">Overview</div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-900 rounded p-2">
                  <div className="text-lg font-bold text-amber-400">{projects.length}</div>
                  <div className="text-xs text-slate-500">Projects</div>
                </div>
                <div className="bg-slate-900 rounded p-2">
                  <div className="text-lg font-bold text-amber-400">{projectNodes.length}</div>
                  <div className="text-xs text-slate-500">Files</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </motion.aside>
  );
};

export default Sidebar;